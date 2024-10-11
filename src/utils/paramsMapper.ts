import { IDataExchange, IQueryParams } from './types/dataExchange';

/**
 * Map the value from an exchange trigger to a representation
 */
export const paramsMapper = async (props: {
    resource: string;
    representationQueryParams: string[];
    dataExchange: IDataExchange;
    url: string;
}) => {
    const { representationQueryParams, dataExchange, resource } = props;
    let { url } = props;

    //if providerParams exists use it
    if (
        dataExchange?.providerParams?.query &&
        dataExchange?.providerParams?.query?.length > 0
    ) {
        url = `${url}${filterAndStringify({
            query: dataExchange?.providerParams?.query,
            representationQueryParams,
        })}`;
    }
    //else find resource params
    else {
        const resourceParams = dataExchange?.resources.find(
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

const filterAndStringify = (props: {
    query: [IQueryParams];
    representationQueryParams: string[];
}) => {
    const filteredArray = props?.query?.filter((obj) => {
        const key = Object.keys(obj)[0];
        return props?.representationQueryParams?.includes(key);
    });

    return '?' + filteredArray
        ?.map((obj) => {
            const key = Object.keys(obj)[0];
            const value = obj[key];
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
};
