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
    const subType = type === 'providerParams' ? 'resources' : 'purposes';

    //if providerParams exists use it
    if (dataExchange[type].query && dataExchange[type]?.query?.length > 0) {
        url = `${url}${filterAndStringify({
            query: dataExchange[type]?.query,
            representationQueryParams,
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
        })}`;
    }
    return { url };
};

/**
 * Process the given query params with the allowed query params configured on the resource self-description and return a string containing the query mapped.
 * @param {object} params
 * @param {IQueryParams[]} params - The query params
 * @param {string[]} params - The query params from the representation
 * @return string
 */
const filterAndStringify = (params: {
    query: [IQueryParams];
    representationQueryParams: string[];
}): string => {
    const filteredArray = params?.query?.filter((obj) => {
        const key = Object.keys(obj)[0];
        return params?.representationQueryParams?.includes(key);
    });

    return (
        '?' +
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
