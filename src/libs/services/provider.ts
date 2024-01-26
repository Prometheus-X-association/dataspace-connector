import axios from 'axios';
import { getEndpoint } from '../loaders/configuration';
import { IDataExchange } from '../../utils/types/dataExchange';

export const providerExport = async (
    providerEndpoint: string,
    dataExchange: IDataExchange,
    contract: string
) => {
    return axios.post(`${providerEndpoint}provider/export`, {
        consumerEndpoint: await getEndpoint(),
        dataExchange,
        contract,
    });
};

const getProviderData = async () => {
    //TODO
};
