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
            element.catalogId === chainId && element.status === 'active'
    );
    if (!chain) return false;

    const foundService = chain.services.find(
        (element: any) =>
            element.service === service ??
            element.pre?.map((preChain: any) =>
                preChain.map(
                    (preService: any) => preService.service === service
                )
            )
    );

    return !!foundService;
};
