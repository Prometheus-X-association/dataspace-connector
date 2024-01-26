import axios from 'axios';

export const consumerError = async (
    consumerEndpoint: string,
    dataExchangeId: string,
    payload: string
) => {
    await axios.put(
        `${consumerEndpoint}dataexchanges/${dataExchangeId}/error`,
        {
            origin: 'provider',
            payload: payload,
        }
    );

    throw Error(payload);
};
