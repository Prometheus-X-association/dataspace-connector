import axios from 'axios';
import { Logger } from '../libs/loggers';
import { PolicyDecisionPoint } from './PolicyDecisionPoint';
import { ActionType } from 'json-odrl-manager';
import { FetcherConfig } from './PolicyFetcher';

export type AccessRequest = {
    /*
     * UID of the target resource
     */
    targetResource: string;
    /*
     * The requested action to be performed on the targeted resource
     */
    action: ActionType;
    /*
     * URL to retrieve the reference policy
     */
    referenceURL: string;
    /*
     * "serviceOfferings.policies"
     */
    referenceDataPath: string;
    /*
     * Fetcher configuration, useful for fetching reference values for leftOperand
     */
    fetcherConfig: FetcherConfig;
};

class PolicyEnforcementPoint {
    private static instance: PolicyEnforcementPoint;
    public showLog: boolean;

    private constructor() {
        this.showLog = false;
    }

    public static getInstance(): PolicyEnforcementPoint {
        if (!PolicyEnforcementPoint.instance) {
            PolicyEnforcementPoint.instance = new PolicyEnforcementPoint();
        }
        return PolicyEnforcementPoint.instance;
    }

    /**
     * enforcePolicy - Enforces the access policy by querying the Policy Decision Point (PDP) with the provided request.
     * @param {AccessRequest} request - The access request to be evaluated by the PDP.
     * @returns {Promise<void>} - A promise resolved when the policy enforcement is complete.
     */
    public async requestAction(request: AccessRequest): Promise<boolean> {
        try {
            const pdp = new PolicyDecisionPoint(request.fetcherConfig);
            const hasPermission = await this.queryPdp(pdp, request);
            if (!hasPermission) {
                throw new Error(
                    `Resquest can't be made on requested resource: ${JSON.stringify(
                        request,
                        null,
                        2
                    )}`
                );
            }
            return true;
        } catch (error: any) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
            return false;
        }
    }

    /**
     * queryPdp - Queries the Policy Decision Point (PDP) to evaluate an access request.
     * @param {PolicyDecisionPoint} pdp - The Policy Decision Point instance.
     * @param {AccessRequest} request - The request to be evaluated.
     * @returns {Promise<boolean>} - A promise resolved to true if the access is permitted, false otherwise.
     */
    private async queryPdp(
        pdp: PolicyDecisionPoint,
        request: AccessRequest
    ): Promise<boolean> {
        try {
            const url = request.referenceURL;
            const response = await axios.get(url);
            if (response.status === 200) {
                const reference = response.data;

                const policies = this.getTargetedPolicies(
                    reference,
                    request.referenceDataPath
                );

                if (Array.isArray(policies)) {
                    for (const policy of policies) {
                        await pdp.addReferencePolicy(policy);
                    }
                    if (this.showLog) {
                        process.stdout.write('[PEP/queryPdp] - reference: ');
                        process.stdout.write(
                            `${JSON.stringify(reference, null, 2)}\n`
                        );
                        pdp.log();
                    }
                    return await pdp.queryResource(
                        request.action,
                        request.targetResource
                    );
                } else {
                    throw new Error('No service offering found.');
                }
            } else {
                throw new Error(`Failed to fetch contract: ${response.status}`);
            }
        } catch (error) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }

    /**
     * getTargetedPolicies - Extract policies from a nested structure based on the provided path.
     * @param {object | object[]} source - The source object or array.
     * @param {string} path - The path to the policies in the structure.
     * @returns {object[]} - An array of policies.
     */
    public getTargetedPolicies(
        source: object | object[],
        path: string
    ): object[] {
        try {
            const keys = path.split('.');
            let current: object | object[] = source;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (Array.isArray(current)) {
                    const attribute = key;
                    current = current.flatMap((item: any) => {
                        const value = item[attribute];
                        if (!value) {
                            throw new Error(
                                `[PEP/getTargetedPolicies]: Path '${path}' not found in the source object.`
                            );
                        }
                        return value;
                    });
                } else {
                    current = current[key as keyof typeof current];
                }
                if (!current) {
                    throw new Error(
                        `[PEP/getTargetedPolicies]: Path '${path}' not found in the source object.`
                    );
                }
            }
            return Array.isArray(current) ? current : [current];
        } catch (error: any) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
            return [];
        }
    }
}

export const PEP = PolicyEnforcementPoint.getInstance();
