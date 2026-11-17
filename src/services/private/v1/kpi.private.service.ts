import { PipelineStage } from 'mongoose';
import { DataExchange } from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { getCatalogUri } from '../../../libs/loaders/configuration';
import { urlChecker } from '../../../utils/urlChecker';
import { Logger } from '../../../libs/loggers';

const SUCCESS_STATUSES = [
    DataExchangeStatusEnum.EXPORT_SUCCESS,
    DataExchangeStatusEnum.IMPORT_SUCCESS,
];

const ERROR_STATUSES = [
    DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
    DataExchangeStatusEnum.CONSENT_IMPORT_ERROR,
    DataExchangeStatusEnum.CONSENT_EXPORT_ERROR,
    DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR,
    DataExchangeStatusEnum.UNDEFINED_ERROR,
    DataExchangeStatusEnum.PEP_ERROR,
    DataExchangeStatusEnum.NODE_CALLBACK_ERROR,
    // Legacy / lowercase status used by older seed data.
    'failed' as unknown as DataExchangeStatusEnum,
];

type Role = 'provider' | 'consumer';

function buildRolePipeline(role?: Role): PipelineStage[] {
    if (role === 'provider')
        return [{ $match: { consumerEndpoint: { $exists: true, $ne: null } } }];
    if (role === 'consumer')
        return [{ $match: { providerEndpoint: { $exists: true, $ne: null } } }];
    return [];
}

export interface KpiOverview {
    totalExchanges: number;
    completedExchanges: number;
    successfulExchanges: number;
    globalSuccessRate: number;
    totalBytesTransferred: number;
    simpleExchanges: number;
    serviceChainExchanges: number;
}

export interface KpiByOffer {
    serviceOffering: string;
    name?: string;
    totalExchanges: number;
    successfulExchanges: number;
    successRate: number;
}

export interface KpiError {
    _id: string;
    contract?: string;
    ecosystemName?: string;
    serviceOffering?: string;
    offerName?: string;
    status: string;
    errorMessage?: string;
    errorLocation?: string;
    payload?: string;
    participantEndpoint?: string;
    participantName?: string;
    connectorName: string;
    createdAt: string;
}

export interface KpiServiceChain {
    totalServiceChainExchanges: number;
    successfulServiceChainExchanges: number;
    successRate: number;
}

export interface KpiSimple {
    totalSimpleExchanges: number;
    successfulSimpleExchanges: number;
    successRate: number;
}

export interface KpiVolume {
    totalBytesTransferred: number;
    byteCoverageNote: string;
    exchangesByDay: { date: string; count: number }[];
}

const BYTE_COVERAGE_NOTE =
    'Only REST non-service-chain exchanges report a size. This total is partial.';

const serviceChainFilter = { 'serviceChain.services.0': { $exists: true } };
const simpleFilter = { 'serviceChain.services.0': { $exists: false } };

/**
 * Pull every published service offering from the catalog and index them by id.
 * Lets us resolve offer names without doing N axios.gets — and works even
 * when the offer URIs stored on the doc point at hosts the connector can't
 * reach (e.g. seed data with `localhost` URIs viewed from inside Docker).
 */
async function loadOfferNameById(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    try {
        const catalogUri = await getCatalogUri();
        if (!catalogUri) return map;
        // Pull a generous page; production catalogs cap their own response.
        const url = urlChecker(catalogUri, 'serviceofferings?limit=1000');
        const res = await getCatalogData(url);
        const list = Array.isArray(res.data)
            ? res.data
            : res.data?.result ??
              res.data?.data?.result ??
              res.data?.items ??
              [];
        for (const offer of list as Array<{ _id?: string; name?: string }>) {
            if (offer?._id && offer?.name) {
                map.set(String(offer._id), offer.name);
            }
        }
    } catch (e) {
        Logger.warn({
            message: `KPI errors: failed to load offers for name resolution: ${
                (e as Error).message
            }`,
            location: 'getKpiErrorsService.loadOfferNameById',
        });
    }
    return map;
}

/**
 * Pull the full ecosystem list from the catalog (visionstrust-casa) and index
 * each ecosystem's display name by the contract id it references. Errors are
 * swallowed so a flaky catalog never breaks the failures table.
 */
async function loadEcosystemNameByContractId(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    try {
        const catalogUri = await getCatalogUri();
        if (!catalogUri) return map;
        const url = urlChecker(catalogUri, 'ecosystems');
        const res = await getCatalogData(url);
        const list = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        for (const eco of list as Array<{
            name?: string;
            contract?: string | { _id?: string };
        }>) {
            const contractId =
                typeof eco.contract === 'string'
                    ? eco.contract
                    : eco.contract?._id;
            if (eco?.name && contractId) {
                map.set(String(contractId), eco.name);
            }
        }
    } catch (e) {
        Logger.warn({
            message: `KPI errors: failed to load ecosystems for name resolution: ${
                (e as Error).message
            }`,
            location: 'getKpiErrorsService.loadEcosystemNameByContractId',
        });
    }
    return map;
}

/**
 * Returns a global overview of all data exchanges:
 * total count, completed count, successful count, global success rate,
 * total bytes transferred, and a breakdown between simple and service-chain types.
 * @returns Promise<KpiOverview>
 */
export const getKpiOverviewService = async (
    role?: Role
): Promise<KpiOverview> => {
    const [result] = await DataExchange.aggregate([
        ...buildRolePipeline(role),
        {
            $facet: {
                total: [{ $count: 'count' }],
                completed: [
                    {
                        $match: {
                            status: { $ne: DataExchangeStatusEnum.PENDING },
                        },
                    },
                    { $count: 'count' },
                ],
                successful: [
                    { $match: { status: { $in: SUCCESS_STATUSES } } },
                    { $count: 'count' },
                ],
                bytes: [
                    {
                        $match: {
                            'providerData.size': {
                                $exists: true,
                                $type: 'number',
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$providerData.size' },
                        },
                    },
                ],
                serviceChain: [
                    { $match: serviceChainFilter },
                    { $count: 'count' },
                ],
                simple: [{ $match: simpleFilter }, { $count: 'count' }],
            },
        },
    ]);

    const totalExchanges: number = result.total[0]?.count ?? 0;
    const completedExchanges: number = result.completed[0]?.count ?? 0;
    const successfulExchanges: number = result.successful[0]?.count ?? 0;
    const totalBytesTransferred: number = result.bytes[0]?.total ?? 0;
    const serviceChainExchanges: number = result.serviceChain[0]?.count ?? 0;
    const simpleExchanges: number = result.simple[0]?.count ?? 0;

    return {
        totalExchanges,
        completedExchanges,
        successfulExchanges,
        globalSuccessRate:
            totalExchanges > 0
                ? Math.round((successfulExchanges / totalExchanges) * 1000) /
                  1000
                : 0,
        totalBytesTransferred,
        simpleExchanges,
        serviceChainExchanges,
    };
};

/**
 * Returns exchange counts and success rates grouped by service offering URI.
 * Supports two grouping modes:
 * - 'resource': groups by the provider's resource offering (default)
 * - 'purpose': groups by the consumer's purpose offering
 * Results are sorted by total exchange count descending.
 * @param {'resource' | 'purpose'} type - Which offering dimension to group by
 * @returns Promise<KpiByOffer[]>
 */
export const getKpiByOfferService = async (
    type: 'resource' | 'purpose' = 'resource',
    role?: Role
): Promise<KpiByOffer[]> => {
    const field =
        type === 'purpose'
            ? 'purposes.serviceOffering'
            : 'resources.serviceOffering';

    const arrayField = type === 'purpose' ? 'purposes' : 'resources';

    const results = await DataExchange.aggregate([
        ...buildRolePipeline(role),
        { $unwind: `$${arrayField}` },
        {
            $match: {
                [`${arrayField}.serviceOffering`]: { $exists: true, $ne: null },
            },
        },
        {
            $group: {
                _id: `$${arrayField}.serviceOffering`,
                totalExchanges: { $sum: 1 },
                successfulExchanges: {
                    $sum: {
                        $cond: [{ $in: ['$status', SUCCESS_STATUSES] }, 1, 0],
                    },
                },
            },
        },
        { $sort: { totalExchanges: -1 } },
    ]);

    const names = await Promise.all(
        results.map(async (r) => {
            try {
                const res = await getCatalogData(r._id as string);
                return (res.data?.name as string) ?? undefined;
            } catch {
                return undefined;
            }
        })
    );

    return results.map((r, i) => ({
        serviceOffering: r._id as string,
        name: names[i],
        totalExchanges: r.totalExchanges as number,
        successfulExchanges: r.successfulExchanges as number,
        successRate:
            r.totalExchanges > 0
                ? Math.round(
                      (r.successfulExchanges / r.totalExchanges) * 1000
                  ) / 1000
                : 0,
    }));
};

/**
 * Returns exchange counts and success rate for service-chain exchanges only.
 * A service-chain exchange is any DataExchange document whose
 * serviceChain.services array contains at least one entry.
 * Note: each individual step in a chain is counted as a separate exchange.
 * @returns Promise<KpiServiceChain>
 */
export const getKpiServiceChainService = async (
    role?: Role
): Promise<KpiServiceChain> => {
    const [result] = await DataExchange.aggregate([
        ...buildRolePipeline(role),
        { $match: serviceChainFilter },
        {
            $facet: {
                total: [{ $count: 'count' }],
                successful: [
                    { $match: { status: { $in: SUCCESS_STATUSES } } },
                    { $count: 'count' },
                ],
            },
        },
    ]);

    const totalServiceChainExchanges: number = result.total[0]?.count ?? 0;
    const successfulServiceChainExchanges: number =
        result.successful[0]?.count ?? 0;

    return {
        totalServiceChainExchanges,
        successfulServiceChainExchanges,
        successRate:
            totalServiceChainExchanges > 0
                ? Math.round(
                      (successfulServiceChainExchanges /
                          totalServiceChainExchanges) *
                          1000
                  ) / 1000
                : 0,
    };
};

/**
 * Returns exchange counts and success rate for simple (bilateral) exchanges only.
 * A simple exchange is any DataExchange document whose
 * serviceChain.services array is absent or empty.
 * @returns Promise<KpiSimple>
 */
export const getKpiSimpleService = async (role?: Role): Promise<KpiSimple> => {
    const [result] = await DataExchange.aggregate([
        ...buildRolePipeline(role),
        { $match: simpleFilter },
        {
            $facet: {
                total: [{ $count: 'count' }],
                successful: [
                    { $match: { status: { $in: SUCCESS_STATUSES } } },
                    { $count: 'count' },
                ],
            },
        },
    ]);

    const totalSimpleExchanges: number = result.total[0]?.count ?? 0;
    const successfulSimpleExchanges: number = result.successful[0]?.count ?? 0;

    return {
        totalSimpleExchanges,
        successfulSimpleExchanges,
        successRate:
            totalSimpleExchanges > 0
                ? Math.round(
                      (successfulSimpleExchanges / totalSimpleExchanges) * 1000
                  ) / 1000
                : 0,
    };
};

/**
 * Returns total bytes transferred and a daily exchange count time-series.
 * An optional date range can be supplied to narrow the time window.
 * Note: byte totals only cover REST non-service-chain exchanges (where providerData.size is set).
 * @param {string} [from] - Start of the date range as an ISO 8601 string (inclusive)
 * @param {string} [to]   - End of the date range as an ISO 8601 string (inclusive)
 * @returns Promise<KpiVolume>
 */
export const getKpiVolumeService = async (
    from?: string,
    to?: string,
    role?: Role
): Promise<KpiVolume> => {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const timeMatch =
        Object.keys(dateFilter).length > 0
            ? { $match: { createdAt: dateFilter } }
            : null;

    const basePipeline = [
        ...buildRolePipeline(role),
        ...(timeMatch ? [timeMatch] : []),
    ];

    const [result] = await DataExchange.aggregate([
        ...basePipeline,
        {
            $facet: {
                bytes: [
                    {
                        $match: {
                            'providerData.size': {
                                $exists: true,
                                $type: 'number',
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$providerData.size' },
                        },
                    },
                ],
                byDay: [
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: '%Y-%m-%d',
                                    date: { $toDate: '$createdAt' },
                                },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 as const } },
                ],
            },
        },
    ]);

    return {
        totalBytesTransferred: result.bytes[0]?.total ?? 0,
        byteCoverageNote: BYTE_COVERAGE_NOTE,
        exchangesByDay: (result.byDay as { _id: string; count: number }[]).map(
            (d) => ({ date: d._id, count: d.count })
        ),
    };
};

/**
 * Returns the most recent failed exchanges (up to 50), filtered by role.
 * Each entry includes contract, status, error details, payload, the remote
 * participant's endpoint, and the local connector name.
 * @param {Role} [role] - 'provider' | 'consumer' — omit for all roles
 * @returns Promise<KpiError[]>
 */
export const getKpiErrorsService = async (role?: Role): Promise<KpiError[]> => {
    const roleFilter =
        role === 'provider'
            ? { consumerEndpoint: { $exists: true, $ne: null } }
            : role === 'consumer'
            ? { providerEndpoint: { $exists: true, $ne: null } }
            : {};

    const docs = await DataExchange.find({
        ...roleFilter,
        status: { $in: ERROR_STATUSES },
    })
        .select(
            'contract resources status error payload consumerEndpoint providerEndpoint createdAt ecosystemName offerName'
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    const connectorName = process.env.NAME ?? 'unknown';

    const participantEndpoints = docs.map((r) =>
        role === 'consumer' ? r.providerEndpoint : r.consumerEndpoint
    );

    const offerUris = docs.map(
        (r) => r.resources?.[0]?.serviceOffering as string | undefined
    );

    // Dedupe URIs so each remote resource is fetched at most once.
    const fetchNameByUri = async (
        uris: (string | undefined)[]
    ): Promise<Map<string, string | undefined>> => {
        const unique = Array.from(
            new Set(uris.filter((u): u is string => Boolean(u)))
        );
        const entries = await Promise.all(
            unique.map(async (uri) => {
                try {
                    const res = await getCatalogData(uri);
                    return [uri, (res.data?.name as string) ?? undefined] as const;
                } catch {
                    return [uri, undefined] as const;
                }
            })
        );
        return new Map(entries);
    };

    // Pull the catalog's full ecosystems + offers lists in parallel and index
    // them by the id we'll be matching against. This lets us resolve every
    // row's display names with two HTTP calls total instead of N per-row.
    const [ecosystemNameByContractId, offerNameById] = await Promise.all([
        loadEcosystemNameByContractId(),
        loadOfferNameById(),
    ]);

    const lastSegment = (uri: string | undefined): string | undefined => {
        if (!uri) return undefined;
        try {
            const u = new URL(uri);
            const parts = u.pathname.split('/').filter(Boolean);
            return parts[parts.length - 1];
        } catch {
            return uri.split('/').filter(Boolean).pop();
        }
    };

    const participantNames = await fetchNameByUri(participantEndpoints);

    return docs.map((r, i) => {
        const snapshotEcosystem = (r as { ecosystemName?: string }).ecosystemName;
        const snapshotOffer = (r as { offerName?: string }).offerName;
        const contractId = lastSegment(r.contract);
        const liveEcosystemName = contractId
            ? ecosystemNameByContractId.get(contractId)
            : undefined;
        const offerUri = offerUris[i];
        const offerId = lastSegment(offerUri);
        const liveOfferName = offerId ? offerNameById.get(offerId) : undefined;
        const participantEndpoint = participantEndpoints[i];
        return {
            _id: (r._id as { toString(): string }).toString(),
            contract: r.contract,
            ecosystemName: liveEcosystemName ?? snapshotEcosystem,
            serviceOffering: offerUri,
            offerName: liveOfferName ?? snapshotOffer,
            status: r.status,
            errorMessage: r.error?.message,
            errorLocation: r.error?.location,
            payload: r.payload,
            participantEndpoint,
            participantName: participantEndpoint
                ? participantNames.get(participantEndpoint)
                : undefined,
            connectorName,
            createdAt: new Date(r.createdAt as unknown as string).toISOString(),
        };
    });
};
