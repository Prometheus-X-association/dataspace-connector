import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import { getContractData } from '../../../libs/third-party/contract';
import { urlChecker } from '../../../utils/urlChecker';
import {
    getCatalogUri,
    getContractUri,
    getDvctUri,
} from '../../../libs/loaders/configuration';
import { get } from 'http';

export const getDVCTData = async (
    participantId: string,
    prevDataId: string,
    contractId: string,
    providerEndpoint: string,
    consumerEndpoint: string,
    providerId: string,
    serviceChain: any
) => {
    try {
        let contractUri = await getContractUri();
        contractUri += `contracts/${contractId}`;
        const contractResponse = await getContractData(contractUri);

        const serviceChains = contractResponse.serviceChains;
        let reachEndFlow = false;

        if (serviceChains.length > 0) {
            reachEndFlow = true;
        }

        const useCaseName = await getUseCaseName(contractResponse.ecosystem);

        const dvctId = await getDvctUri();

        const providerService = contractResponse.serviceOfferings.find((so) => {
            return so.participant === providerId;
        });

        const dataId = providerService.participant;

        const currentServiceChain = contractResponse.serviceChains.find(
            (sc) => {
                return sc.catalogId === serviceChain.catalogId;
            }
        );

        const participantSharePromises = contractResponse.members.map(
            async (member) => {
                return await getParticipantShare(
                    member.participant,
                    currentServiceChain,
                    contractResponse.orchestrator,
                    contractResponse.members
                );
            }
        );

        const participantShare = await Promise.all(participantSharePromises);

        const dvct = {
            dvctId: dvctId,
            contractId: contractResponse._id,
            useCaseContractTitle: useCaseName,
            dataId: dataId,
            dataProviderId: providerEndpoint,
            dataConsumerId: consumerEndpoint,
            prevDataId: prevDataId,
            factorCheck: true,
            reachEndFlow: reachEndFlow,
            providerUrl: 'TBD',
            useCaseId: contractResponse.ecosystem,
            useCaseName: useCaseName,
            dataQualityCheck: 'TBD',
            participantShare: participantShare,
        };

        return dvct;
    } catch (error) {
        Logger.error(error);
        throw error;
    }
};

const getParticipantShare = async (
    participantId: string,
    serviceChain: any,
    orchestratorId: string,
    members: any
) => {
    const participantInfos = await getParticipantInfo(participantId);
    const rewardDepositor = participantId === orchestratorId;

    let role;
    members.forEach((member: any) => {
        if (member.participant === participantId) {
            role = member.role;
        }
    });
    let numOfShare = 0;
    serviceChain.services.forEach((service: any) => {
        if (service.participant === participantId) {
            numOfShare += service.incentivePoints;
        }
    });

    const participantShare = {
        participantName: participantInfos.legalName,
        rewardDepositor: rewardDepositor,
        role: role,
        participantId: participantId,
        participantWallet: 'TBD',
        numOfShare: numOfShare,
    };
    return participantShare;
};

const getParticipantInfo = async (participantId: string) => {
    const catalogResults = await handle(
        axios.get(urlChecker(participantId, ''))
    );
    const participantInfo = {
        participantId: catalogResults[0].participantId,
        legalName: catalogResults[0].legalName,
        role: catalogResults[0].role,
    };
    return participantInfo;
};
const getUseCaseName = async (catalogURI: string) => {
    const catalogResults = await handle(axios.get(urlChecker(catalogURI, '')));
    return catalogResults[0].name;
};

export const sendDVCT = async (
    participantId: string,
    prevDataId: string,
    contractId: string,
    providerEndpoint: string,
    consumerEndpoint: string,
    providerId: string,
    serviceChain: any
): Promise<number> => {
    try {
        const dvctPayload = await getDVCTData(
            participantId,
            prevDataId,
            contractId,
            providerEndpoint,
            consumerEndpoint,
            providerId,
            serviceChain
        );

        const dvctUri = await getDvctUri();

        if (!dvctUri || dvctUri === '') throw new Error('No DVCT URI');
        const dvctResults = await axios.post(urlChecker(dvctUri, 'track'), {
            dvctPayload,
        });

        return dvctResults.status;
    } catch (error) {
        Logger.error(error.message);
        throw error;
    }
};
