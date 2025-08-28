import { IDataExchange, IQueryParams } from './types/dataExchange';

/**
 * Map the value from an exchange trigger to a representation
 * @param {Object} params
 * @param {string} params.resource - The resource Self description URL
 * @param {string[]} params.representationQueryParams - The query params to add to the URL
 * @param {IDataExchange} params.dataExchange - Data exchange
 * @param {string} params.url - URL
 */
export const paramsMapper = async (params: {
    resource: string;
    representationQueryParams: string[];
    dataExchange: IDataExchange;
    url: string;
    type: 'providerParams' | 'consumerParams';
}) => {
    const { representationQueryParams, dataExchange, resource, type } = params;
    let { url } = params;
    const isAlreadyParamInUrl = params.url.includes('?');
    const subType = type === 'providerParams' ? 'resources' : 'purposes';

    //if providerParams exists use it
    if (dataExchange[type].query && dataExchange[type]?.query?.length > 0) {
        url = `${url}${filterAndStringify({
            query: dataExchange[type]?.query,
            representationQueryParams,
            isAlreadyParamInUrl,
        })}`;
    }
    //else find resource params
    else {
        const resourceParams = dataExchange[subType].find(
            (element) => element?.resource === resource
        );
        if (!resourceParams || !resourceParams.params) {
            return { url };
        }

        url = `${url}${filterAndStringify({
            query: resourceParams?.params?.query,
            representationQueryParams,
            isAlreadyParamInUrl,
        })}`;
    }
    return { url };
};

/**
 * Process the given query params with the allowed query params configured on the resource self-description and return a string containing the query mapped.
 * @param {object} params
 * @param {IQueryParams[]} params.query - The query params
 * @param {string[]} params.representationQueryParams - The query params from the representation
 * @param {boolean} params.isAlreadyParamInUrl - Flag to indicate if the URL already contains query params, and therefore a question mark
 * @return string
 */
const filterAndStringify = (params: {
    query: [IQueryParams];
    representationQueryParams: string[];
    isAlreadyParamInUrl: boolean;
}): string => {
    const filteredArray = params?.query?.filter((obj) => {
        const key = Object.keys(obj)[0];
        return params?.representationQueryParams?.includes(key);
    });

    return (
        (params?.isAlreadyParamInUrl ? '&' : '?') +
        filteredArray
            ?.map((obj) => {
                const key = Object.keys(obj)[0];
                const value = obj[key];
                return `${encodeURIComponent(key)}=${encodeURIComponent(
                    value
                )}`;
            })
            .join('&')
    );
};
