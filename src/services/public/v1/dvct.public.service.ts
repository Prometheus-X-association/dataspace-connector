import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import { getContractData } from '../../../libs/third-party/contract';
import { urlChecker } from '../../../utils/urlChecker';
import { getDvctUri } from '../../../libs/loaders/configuration';
import fs from 'fs';
import { ContractResponseType } from '../../../utils/responses/contract.response';

export const getDVCTData = async (
    prevDataId: string,
    providerEndpoint: string,
    consumerEndpoint: string,
    providerId: string,
    serviceChain: any,
    prevOfferId: string,
    currentParticipantId: string,
    nextOfferId: string,
    reachEndFlow?: boolean,
    contractResponse?: ContractResponseType
) => {
    try {
        const useCaseName = await getUseCaseName(contractResponse.ecosystem);

        const dvctId = await getDvctUri();

        const providerService = contractResponse.serviceOfferings.find(
            (so: { participant: string }) => {
                return so.participant === providerId;
            }
        );

        const dataId = providerService.participant;

        const currentServiceChain = contractResponse.serviceChains.find(
            (sc: { catalogId: string }) => {
                return sc.catalogId === serviceChain.catalogId;
            }
        );

        const previousParticipantURL = getParticipantURLbyOffer(
            prevOfferId,
            currentServiceChain
        );
        const currentParticipantURL = getParticipantURLbyId(
            currentParticipantId,
            currentServiceChain
        );
        const nextParticipantURL = getParticipantURLbyOffer(
            nextOfferId,
            currentServiceChain
        );

        const participantSharePromises = contractResponse.members.map(
            async (member: { participant: string }) => {
                const role = await getParticipantRoleFromEcosystem(
                    member.participant,
                    contractResponse.ecosystem
                );
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
            prevParticipantId: previousParticipantURL,
            currentParticipantId: currentParticipantURL,
            nextParticipantId: nextParticipantURL,
        };

        const outputFile = 'result.json';

        fs.writeFile(outputFile, JSON.stringify(dvct, null, 2), (err) => {
            // Optional logging
        });

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
            numOfShare = service.incentivePoints;
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

const getParticipantURLbyId = (participantId: string, serviceChain: any) => {
    let result = '';
    serviceChain.services.map((service: any) => {
        if (service.participant.endsWith(participantId)) {
            result = service.participant;
        }
    });
    return result;
};

const getParticipantURLbyOffer = (offerId: string, serviceChain: any) => {
    let result = '';
    serviceChain.services.map((service: any) => {
        if (service.service.endsWith(offerId)) {
            result = service.participant;
        }
    });
    return result;
};

const getParticipantRoleFromEcosystem = async (
    participantId: string,
    catalogURI: string
) => {
    const catalogResults = await handle(axios.get(urlChecker(catalogURI, '')));
    let role = 'None';
    catalogResults[0].participants.map((participant: any) => {
        if (participantId.endsWith(participant.participant)) {
            role = participant.roles[0];
        }
    });
    return role;
};

export const sendDVCT = async (
    prevDataId: string,
    providerEndpoint: string,
    consumerEndpoint: string,
    providerId: string,
    serviceChain: any,
    prevOfferId: string,
    currentParticipantId: string,
    nextOfferId: string,
    reachEndFlow: boolean,
    contractResp: ContractResponseType
): Promise<number> => {
    const dvctUri = await getDvctUri();

    const dvctPayload = await getDVCTData(
        prevDataId,
        providerEndpoint,
        consumerEndpoint,
        providerId,
        serviceChain,
        prevOfferId,
        currentParticipantId,
        nextOfferId,
        reachEndFlow,
        contractResp
    );

    const dvctResults = await axios.post(
        urlChecker(dvctUri + 'run-script', ''),
        dvctPayload
    );
    return dvctResults.status;
};
