import axios from "axios";
import { Logger } from "../libs/loggers/Logger";
import { PolicyDecisionPoint } from "./PolicyDecisionPoint";
import { ActionType } from "json-odrl-manager";
import { FetcherConfig } from "./PolicyFetcher";

export type AccessRequest = {
    /*
     * Requested action
     */
    action: ActionType;
    /*
     * Resource uid
     */
    target: string;
    /*
     * Url to retrieve the reference policy
     */
    contractUrl: string;
    /*
     * Fetcher config
     */
    config: FetcherConfig;
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
            const pdp = new PolicyDecisionPoint(request.config);
            const hasPermission = await this.queryPdp(pdp, request);
            if (!hasPermission) {
                throw new Error("Resquest can't be made on requested resource");
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
            const url = request.contractUrl;
            const response = await axios.get(url);
            if (response.status === 200) {
                const contract = response.data;
                if (Array.isArray(contract.serviceOfferings)) {
                    contract.serviceOfferings.forEach(
                        (serviceOffering: any) => {
                            const { policies } = serviceOffering;
                            if (Array.isArray(policies)) {
                                policies.forEach((policy: any) => {
                                    pdp.addReferencePolicy(policy);
                                });
                            }
                        }
                    );
                    if (this.showLog) {
                        process.stdout.write("[PEP/queryPdp] - contract: ");
                        process.stdout.write(
                            `${JSON.stringify(contract, null, 2)}\n`
                        );
                        pdp.log();
                    }
                    return await pdp.queryResource(
                        request.action,
                        request.target
                    );
                } else {
                    throw new Error("No service offering found.");
                }
            } else {
                throw new Error(`Failed to fetch contract: ${response.status}`);
            }
        } catch (error) {
            process.stdout.write(
                `Error during pdp evaluation: ${error.message}`
            );
        }
    }
}

export const PEP = PolicyEnforcementPoint.getInstance();
