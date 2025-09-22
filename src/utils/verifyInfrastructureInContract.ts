import { ContractResponseType } from './responses/contract.response';

export const verifyInfrastructureInContract = (props: {
    service: string;
    contract: ContractResponseType;
    chainId: string;
}): boolean => {
    const { service, contract, chainId } = props;
    //verify that the contract contain this chain and the chain contain the service
    const chain = contract.serviceChains.find(
        (element) =>
            element.catalogId === chainId || element.serviceChainId === chainId
    );
    if (!chain) {
        throw Error(
            `Chain with catalogId ${chainId} not found in the contract ${contract._id}. Chain is stopping here and not sending data to remote service.`
        );
    }

    const foundService = chain.services.find(
        (element: any) =>
            element.service === service ??
            element.pre?.map((preChain: any) =>
                preChain.map(
                    (preService: any) => preService.service === service
                )
            )
    );

    if (!foundService) {
        throw Error(
            `Service ${service} not found in the chain ${chainId} from the contract ${contract._id}. Chain is stopping here and not sending data to remote service.`
        );
    }

    return !!foundService;
};
