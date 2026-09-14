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

export type ControlPlaneParticipant = 'provider' | 'consumer';

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
    const exchange = await DataExchange.findById(exchangeId);
    if (!exchange || exchange.workflow !== 'control-plane') {
        throw new ExchangeError(
            'Control-plane exchange not found',
            'authorizeControlPlaneParticipant',
            404
        );
    }

    const localEndpoint = await getEndpoint();
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
    const authorized = verificationResults.every((result) => result.success);

    exchange.controlPlane = {
        ...exchange.controlPlane,
        [participant === 'provider'
            ? 'providerAuthorizedAt'
            : 'consumerAuthorizedAt']: authorized ? new Date() : undefined,
    };
    await exchange.save();
    await exchange.syncControlPlane();
    await publishControlPlaneEvent(
        authorized ? 'participant.authorized' : 'participant.denied',
        exchange
    );

    return { authorized, exchange };
};

export const getControlPlaneExchange = async (
    exchangeId: string
): Promise<IDataExchange> => {
    const exchange = await DataExchange.findById(exchangeId);
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
    const exchange = await DataExchange.findById(exchangeId);
    if (!exchange || exchange.workflow !== 'control-plane') {
        throw new ExchangeError(
            'Control-plane exchange not found',
            'reportControlPlaneTransfer',
            404
        );
    }

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

    return exchange;
};
