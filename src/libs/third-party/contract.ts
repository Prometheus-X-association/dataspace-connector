import axios from 'axios';
import { BilateralResponseType } from '../../utils/responses/bilateral.response';
import { ContractResponseType } from '../../utils/responses/contract.response';
import {checkConnectorProxy} from "./proxy";
import {getProxy} from "../loaders/configuration";

export const getContract = async (
    contractUri: string
): Promise<ContractResponseType | BilateralResponseType> => {
    return await axios.get(contractUri, (await checkConnectorProxy({
        configProxy: getProxy()
    })));
};

export const getContractData = async (
    contractUri: string
): Promise<ContractResponseType> => {
    const response = await axios.get(contractUri);
    return response.data;
};
