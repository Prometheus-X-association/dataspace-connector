import axios from 'axios';

export const getCatalogData = async (endpoint: string, options?: any) => {
    return axios.get(endpoint, options);
};
