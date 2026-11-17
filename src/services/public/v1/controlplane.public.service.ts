import { ExchangeError } from '../../../libs/errors/exchangeError';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { pepVerification } from '../../../utils/pepVerification';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { validateConsent } from '../../../libs/third-party/validateConsent';
import {
    DataExchange,
    IData,
    IDataExchange,
    IParams,
} from '../../../utils/types/dataExchange';
import * as consumerService from './consumer.public.service';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { publishControlPlaneEvent } from './controlplane.events.service';
import {synchronizeServiceChain} from "../../../utils/serviceChainSynchronizer";
import {ObjectId} from "mongodb";
import {getCatalogData} from "../../../libs/third-party/catalog";
import {handle} from "../../../libs/loaders/handler";

export type ControlPlaneParticipant = 'provider' | 'consumer' | 'infrastructure';

export type ControlPlaneTransferMetadata = {
    checksum: string;
    mimetype: string;
    size: number;
};

export type ControlPlaneConsent = {
    signedConsent: string;
    encrypted: string;
};

export type ControlPlaneTrigger = {
    contract: string;
    resources?: string[] | IData[];
    purposes?: string[] | IData[];
    resourceId?: string;
    purposeId?: string;
    providerParams?: IParams;
    consumerParams?: IParams;
    serviceChainId?: string;
    serviceChainParams?: IParams;
    callbackUrl?: string;
};

const authorizationDurationMs = 5 * 60 * 1000;

export const createControlPlaneExchange = async (
    props: ControlPlaneTrigger
): Promise<IDataExchange> => {
    const authorizationExpiresAt = new Date(
        Date.now() + authorizationDurationMs
    );
    const exchangeProps = {
        ...props,
        resources: props.resources ?? [],
        purposes: props.purposes ?? [],
    };

    const { dataExchange } = props.contract.includes('contracts')
        ? await consumerService.triggerEcosystemFlow({
              ...exchangeProps,
              resourceId: props.resourceId || '',
              purposeId: props.purposeId || '',
          })
        : await consumerService.triggerBilateralFlow(exchangeProps);

    const localEndpoint = await getEndpoint();
    if (dataExchange.providerEndpoint === localEndpoint) {
        dataExchange.consumerEndpoint =
            dataExchange.consumerEndpoint ?? localEndpoint;
    } else {
        dataExchange.providerEndpoint =
            dataExchange.providerEndpoint ?? localEndpoint;
        dataExchange.consumerEndpoint =
            dataExchange.consumerEndpoint ?? localEndpoint;
    }
    dataExchange.workflow = 'control-plane';
    dataExchange.controlPlane = {
        callbackUrl: props.callbackUrl,
        authorizationExpiresAt,
    };

    await dataExchange.syncControlPlane();
    await synchronizeServiceChain(dataExchange, exchangeProps.serviceChainId)
    await publishControlPlaneEvent('exchange.created', dataExchange);

    return dataExchange;
};

export const createConsentControlPlaneExchange = async (
    consent: ControlPlaneConsent,
    callbackUrl?: string
): Promise<IDataExchange> => {
    const decryptedConsent = await decryptSignedConsent(
        consent.signedConsent,
        consent.encrypted
    );
    const validation = await validateConsent(
        consent.signedConsent,
        consent.encrypted
    );
    if (!validation.verified) {
        throw new ExchangeError(
            'Consent is not verified',
            'createConsentControlPlaneExchange',
            403
        );
    }

    const dataExchange = await DataExchange.create({
        providerEndpoint: await getEndpoint(),
        consumerEndpoint: decryptedConsent.dataConsumer.dataspaceEndpoint,
        resources: decryptedConsent.data,
        purposes: decryptedConsent.purposes,
        purposeId: decryptedConsent.purposes[0].resource,
        contract: decryptedConsent.contract,
        status: DataExchangeStatusEnum.PENDING,
        consentId: decryptedConsent._id,
        createdAt: new Date(),
        serviceChain: decryptedConsent.recipientThirdParties,
        workflow: 'control-plane',
        controlPlane: {
            callbackUrl,
            authorizationExpiresAt: new Date(
                Date.now() + authorizationDurationMs
            ),
        },
    });

    await dataExchange.createDataExchangeToOtherParticipant('consumer');
    await dataExchange.syncControlPlane();
    await publishControlPlaneEvent('exchange.created', dataExchange);

    return dataExchange;
};

export const authorizeControlPlaneParticipant = async (
    exchangeId: string,
    participant: ControlPlaneParticipant,
    consent?: ControlPlaneConsent
): Promise<{
    authorized: boolean;
    exchange: IDataExchange;
}> => {
    const exchange = await DataExchange.findOne({
        '$or': [{ _id: exchangeId}, { consumerDataExchange: exchangeId }, { providerDataExchange: exchangeId }],
    });
    if (!exchange || exchange.workflow !== 'control-plane') {
        throw new ExchangeError(
            'Control-plane exchange not found',
            'authorizeControlPlaneParticipant',
            404
        );
    }

    let authorized = false;
    const localEndpoint = await getEndpoint();

    if(exchange.serviceChain && exchange.serviceChain.services.length > 0) {
        const services = exchange.serviceChain.services;
        let currentIndex = -1;
        const participantEndpoints: string[] = [];

        for (let i = 0; i < services.length; i++) {
            const [participantResponse] = await handle(
                getCatalogData(services[i].participant)
            );

            if (participantResponse?.dataspaceEndpoint) {
                participantEndpoints.push(participantResponse.dataspaceEndpoint);
            }

            if (participantResponse?.dataspaceEndpoint === localEndpoint) {
                currentIndex = i;
            }
        }

        if (currentIndex === -1) {
            throw new ExchangeError(
                'Connector is not authorized for this participant role',
                'authorizeControlPlaneParticipant',
                403
            );
        }

        const authorizationExpiresAt =
            exchange.controlPlane?.authorizationExpiresAt;
        if (!authorizationExpiresAt || authorizationExpiresAt < new Date()) {
            return { authorized: false, exchange };
        }

        // Le nœud précédent doit avoir été autorisé
        if (currentIndex > 0 && !services[currentIndex - 1].participantAuthorizedAt) {
            throw new ExchangeError(
                'Previous participant must be authorized first',
                'authorizeControlPlaneParticipant',
                403
            );
        }

        const offer = services[currentIndex];

        // L'autorisation ne peut être donnée qu'une seule fois
        if (offer.participantAuthorizedAt) {
            throw new ExchangeError(
                'Participant has already been authorized',
                'authorizeControlPlaneParticipant',
                409
            );
        }

        if(offer.service.includes('infrastructureservices')) {
            authorized = true;
        } else {
            const verificationResults = await pepVerification({
                consumerID: exchange.consumerEndpoint,
                targetResource: offer.service,
                referenceURL: exchange.contract,
            });

            authorized = verificationResults.success;
        }

            offer.participantAuthorizedAt = authorized ? new Date() : undefined;
            exchange.markModified('serviceChain');
        await exchange.save();

        for(const endpoint of participantEndpoints) {
            if(endpoint !== localEndpoint) {
                await exchange.syncControlPlane(endpoint);
            }
        }
    } else {
        const participantEndpoint =
            participant === 'provider'
                ? exchange.providerEndpoint
                : exchange.consumerEndpoint;

        if (participantEndpoint !== localEndpoint) {
            throw new ExchangeError(
                'Connector is not authorized for this participant role',
                'authorizeControlPlaneParticipant',
                403
            );
        }

        const authorizationExpiresAt =
            exchange.controlPlane?.authorizationExpiresAt;
        if (!authorizationExpiresAt || authorizationExpiresAt < new Date()) {
            return { authorized: false, exchange };
        }

        const alreadyAuthorizedAt =
            participant === 'provider'
                ? exchange.controlPlane?.providerAuthorizedAt
                : exchange.controlPlane?.consumerAuthorizedAt;
        if (alreadyAuthorizedAt) {
            throw new ExchangeError(
                'Participant has already been authorized',
                'authorizeControlPlaneParticipant',
                409
            );
        }

        if (exchange.consentId) {
            if (!consent) {
                throw new ExchangeError(
                    'Signed consent is required for this exchange',
                    'authorizeControlPlaneParticipant',
                    403
                );
            }
            const decryptedConsent = await decryptSignedConsent(
                consent.signedConsent,
                consent.encrypted
            );
            const validation = await validateConsent(
                consent.signedConsent,
                consent.encrypted
            );
            if (
                !validation.verified ||
                decryptedConsent._id !== exchange.consentId
            ) {
                return { authorized: false, exchange };
            }
        }

        const targets =
            participant === 'provider' ? exchange.resources : exchange.purposes;
        const verificationResults = await Promise.all(
            targets.map((target) =>
                pepVerification({
                    consumerID: exchange.consumerEndpoint,
                    targetResource: target.serviceOffering,
                    referenceURL: exchange.contract,
                })
            )
        );

        authorized = verificationResults.every((result) => result.success);

        exchange.controlPlane = {
            ...exchange.controlPlane,
            [participant === 'provider'
                ? 'providerAuthorizedAt'
                : 'consumerAuthorizedAt']: authorized ? new Date() : undefined,
        };
        await exchange.save();
        await exchange.syncControlPlane();
    }

    await publishControlPlaneEvent(
        authorized ? 'participant.authorized' : 'participant.denied',
        exchange
    );

    return { authorized, exchange };
};

export const getControlPlaneExchange = async (
    exchangeId: string
): Promise<IDataExchange> => {
    const exchange = await DataExchange.findOne({
        '$or': [{ _id: exchangeId}, { consumerDataExchange: exchangeId }, { providerDataExchange: exchangeId }],
    });
    if (!exchange || exchange.workflow !== 'control-plane') {
        throw new ExchangeError(
            'Control-plane exchange not found',
            'getControlPlaneExchange',
            404
        );
    }

    return exchange;
};

export const reportControlPlaneTransfer = async (
    exchangeId: string,
    participant: ControlPlaneParticipant,
    success: boolean,
    metadata?: ControlPlaneTransferMetadata
): Promise<IDataExchange> => {
    const exchange = await DataExchange.findOne(
        {
            '$or': [{ _id: exchangeId}, { consumerDataExchange: exchangeId }, { providerDataExchange: exchangeId }],
        }
    );
    if (!exchange || exchange.workflow !== 'control-plane') {
        throw new ExchangeError(
            'Control-plane exchange not found',
            'reportControlPlaneTransfer',
            404
        );
    }

    if(exchange.serviceChain && exchange.serviceChain.services.length > 0) {
        const localEndpoint = await getEndpoint();
        const services = exchange.serviceChain.services;

        let currentIndex = -1;
        const participantEndpoints: string[] = [];
        for (let i = 0; i < services.length; i++) {
            const [participantResponse] = await handle(
                getCatalogData(services[i].participant)
            );
            if (participantResponse?.dataspaceEndpoint) {
                participantEndpoints.push(participantResponse.dataspaceEndpoint);
            }
            if (participantResponse?.dataspaceEndpoint === localEndpoint) {
                currentIndex = i;
            }
        }

        if (currentIndex === -1) {
            throw new ExchangeError(
                'Connector is not authorized for this participant role',
                'reportControlPlaneTransfer',
                403
            );
        }

        const currentNode = services[currentIndex];
        const isFirst = currentIndex === 0;
        const isLast = currentIndex === services.length - 1;

        // Le transfert ne peut être rapporté qu'une seule fois par participant
        if (currentNode.transferCompletedAt) {
            throw new ExchangeError(
                'Participant has already reported its transfer',
                'reportControlPlaneTransfer',
                409
            );
        }

        // Tous les nœuds de la chaîne doivent être autorisés avant le transfert
        const unauthorizedNode = services.find(
            (service) => !service.participantAuthorizedAt
        );
        if (unauthorizedNode) {
            throw new ExchangeError(
                'All participants of the service chain must be authorized before reporting transfer status',
                'reportControlPlaneTransfer',
                403
            );
        }

        // Le nœud précédent doit avoir terminé son transfert
        if (!isFirst && !services[currentIndex - 1].transferCompletedAt) {
            throw new ExchangeError(
                'Previous participant must complete its transfer first',
                'reportControlPlaneTransfer',
                403
            );
        }

        if (metadata) {
            exchange.providerData = metadata;
        }

        if (success) {
            currentNode.transferCompletedAt = new Date();
        }
        exchange.markModified('serviceChain');

        // Premier = provider, dernier = consumer
        if (!success) {
            exchange.status = isFirst
                ? DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR
                : DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR;
        } else if (isFirst) {
            exchange.status = DataExchangeStatusEnum.EXPORT_SUCCESS;
        } else if (isLast) {
            exchange.status = DataExchangeStatusEnum.IMPORT_SUCCESS;
        }

        await exchange.save();
        await exchange.syncControlPlane();

        // Synchronisation avec les autres membres de la chaîne
        if (success) {
            for (const endpoint of participantEndpoints) {
                if (endpoint !== localEndpoint) {
                    await exchange.syncControlPlane(endpoint);
                }
            }
        }
        await publishControlPlaneEvent(
            success ? 'transfer.completed' : 'transfer.failed',
            exchange
        );
    } else {
        const localEndpoint = await getEndpoint();
        const participantEndpoint =
            participant === 'provider'
                ? exchange.providerEndpoint
                : exchange.consumerEndpoint;
        if (participantEndpoint !== localEndpoint) {
            throw new ExchangeError(
                'Connector is not authorized for this participant role',
                'reportControlPlaneTransfer',
                403
            );
        }

        const authorizationTimestamp =
            participant === 'provider'
                ? exchange.controlPlane?.providerAuthorizedAt
                : exchange.controlPlane?.consumerAuthorizedAt;
        if (!authorizationTimestamp) {
            throw new ExchangeError(
                'Participant must be authorized before reporting transfer status',
                'reportControlPlaneTransfer',
                403
            );
        }

        if (metadata) {
            exchange.providerData = metadata;
        }
        exchange.controlPlane = {
            ...exchange.controlPlane,
            [participant === 'provider'
                ? 'providerTransferCompletedAt'
                : 'consumerTransferCompletedAt']: new Date(),
        };
        exchange.status = success
            ? participant === 'provider'
                ? DataExchangeStatusEnum.EXPORT_SUCCESS
                : DataExchangeStatusEnum.IMPORT_SUCCESS
            : participant === 'provider'
                ? DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR
                : DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR;

        await exchange.save();
        await exchange.syncControlPlane();
        await publishControlPlaneEvent(
            success ? 'transfer.completed' : 'transfer.failed',
            exchange
        );
    }

    return exchange;
};
