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

export const getDVCTData = async (
    participantId: string,
    prevDataId: string,
    contractId: string,
    providerEndpoint: string,
    consumerEndpoint: string,
    providerId: string
) => {
    try {
        let rewardDepositor = false;
        let contractUri = await getContractUri();
        contractUri += `contracts/${contractId}`;
        const contractResponse = await getContractData(contractUri);

        const participant = contractResponse.members.find((m) => {
            return m.participant.endsWith(participantId);
        });

        const serviceChains = contractResponse.serviceChains;
        let reachEndFlow = false;

        if (serviceChains.length > 0) {
            reachEndFlow = true;
        }

        if (contractResponse.orchestrator.endsWith(participantId)) {
            rewardDepositor = true;
        }

        const participantName = await getParticipantName(participantId);

        const useCaseName = await getUseCaseName(contractResponse.ecosystem);

        const dvctId = await getDvctUri();

        const incentivePoints = await getIncentivePoints(contractResponse._id);

        const providerService = contractResponse.serviceOfferings.find((so) => {
            return so.participant === providerId;
        });

        const dataId = providerService.participant;

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
            participantShare: {
                participantName: participantName,
                rewardDepositor: rewardDepositor,
                role: participant.role,
                participantId: participantId,
                participantWallet: 'TBD',
                numOfShare: incentivePoints,
            },
        };

        return dvct;
    } catch (error) {
        Logger.error(error);
        throw error;
    }
};

const getParticipantName = async (participantId: string) => {
    const catalogURI = await getCatalogUri();
    const catalogResults = await handle(
        axios.get(urlChecker(catalogURI, 'participants/' + participantId))
    );
    return catalogResults[0].legalName;
};
const getUseCaseName = async (catalogURI: string) => {
    const catalogResults = await handle(axios.get(urlChecker(catalogURI, '')));
    return catalogResults[0].name;
};

const getIncentivePoints = async (contractId: string) => {
    const contractURI = await getContractUri();
    const contractResults = await handle(
        axios.get(urlChecker(contractURI, 'contracts/' + contractId))
    );
    return contractResults[0].serviceChains[0].incentivePoints;
};

export const sendDVCT = async (
    participantId: string,
    prevDataId: string,
    contractId: string,
    providerEndpoint: string,
    consumerEndpoint: string,
    providerId: string
): Promise<number> => {
    try {
        const dvctPayload = await getDVCTData(
            participantId,
            prevDataId,
            contractId,
            providerEndpoint,
            consumerEndpoint,
            providerId
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
