import axios from 'axios';
import { BilateralResponseType } from '../../utils/responses/bilateral.response';
import { ContractResponseType } from '../../utils/responses/contract.response';

export const getContract = async (
    contractUri: string
): Promise<ContractResponseType | BilateralResponseType> => {
    return await axios.get(contractUri);
};
