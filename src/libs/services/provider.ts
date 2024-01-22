import axios from 'axios';
import { getEndpoint } from '../loaders/configuration';

export const providerExport = async (
    providerEndpoint: string,
    dataExchangeId: string,
    contract: string
) => {
    return axios.post(`${providerEndpoint}provider/export`, {
        consumerEndpoint: await getEndpoint(),
        dataExchangeId: dataExchangeId,
        contract,
    });
};

const getProviderData = async () => {
    //TODO
};
