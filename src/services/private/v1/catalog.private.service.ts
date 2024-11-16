import { getCatalogUri } from '../../../libs/loaders/configuration';
import { Catalog } from '../../../utils/types/catalog';
import { urlChecker } from '../../../utils/urlChecker';

/**
 * Get all the catalog
 * @returns Icatalog[]
 */
export const getCatalogService = async () => {
    const catalog = await Catalog.find().select('-__v').lean();
    return catalog;
};

/**
 * Get a catalog by id
 * @param id
 * @returns ICatalog
 */
export const getCatalogByIdService = async (id: string) => {
    const catalog = await Catalog.findById(id).select('-__v').lean();

    return catalog;
};

/**
 * Update a catalog by id
 * @param id
 * @param data
 * @returns ICatalog
 */
export const updateCatalogByIdService = async (id: string, data: any) => {
    const catalog = await Catalog.findByIdAndUpdate(id, {
        ...data,
    })
        .select('-__v')
        .lean();
    return catalog;
};

/**
 * Create a catalog resource
 * @param resourceId
 * @param type
 * @returns ICatalog
 */
export const createCatalogResourceService = async (
    resourceId: string,
    type: string
) => {
    const catalog = await Catalog.create({
        resourceId,
        type,
        endpoint: urlChecker(await getCatalogUri(), `${type}/${resourceId}`),
        enabled: true,
    });
    return catalog;
};
