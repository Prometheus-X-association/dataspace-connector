import {
    ActionType,
    PolicyInstanciator,
    PolicyEvaluator,
} from "json-odrl-manager";
import { PolicyFetcher } from "./PolicyFetcher";
import { Logger } from "../libs/loggers/Logger";

export class PolicyDecisionPoint {
    private static instance: PolicyDecisionPoint = null;
    private policyInstanciator: PolicyInstanciator;
    private policyEvaluator: PolicyEvaluator;
    private policyFetcher: PolicyFetcher;

    public constructor() {
        this.policyInstanciator = new PolicyInstanciator();
        this.policyEvaluator = new PolicyEvaluator();
        this.policyFetcher = new PolicyFetcher();
    }

    public static getSingleton(): PolicyDecisionPoint {
        if (PolicyDecisionPoint.instance === null) {
            PolicyDecisionPoint.instance = new PolicyDecisionPoint();
        }
        return PolicyDecisionPoint.instance;
    }

    /**
     * queryResource - Queries the resource for access permission based on an ODRL action and target identifier.
     * @param {ActionType} action - An ODRL action representing the type of access being requested.
     * @param {string} target - The unique identifier (UID) of the target resource.
     * @returns {Promise<void>} - A promise resolved when the resource query is complete.
     */
    public async queryResource(
        action: ActionType,
        target: string
    ): Promise<void> {
        const isPerformable = await this.policyEvaluator.isActionPerformable(
            action,
            target
        );
        if (isPerformable) {
            //
        }
    }

    public async setup(): Promise<void> {
        this.setPolicyFetcher();
        this.setReferencePolicy({});
    }

    private async setPolicyFetcher(): Promise<void> {
        try {
            if (this.policyFetcher) {
                this.policyEvaluator.setFetcher(this.policyFetcher);
            } else {
                throw new Error("Undefined policy fetcher");
            }
        } catch (error: any) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }

    /**
     * setReferencePolicy - Sets the reference ODRL policy for evaluation.
     * @param {Object} jsonPolicy - The JSON representation of the ODRL policy.
     * @returns {Promise<void>} - A promise resolved when the reference policy is successfully set.
     */
    private async setReferencePolicy(json: any): Promise<void> {
        try {
            const policy = this.policyInstanciator.genPolicyFrom(json);
            if (policy) {
                this.policyEvaluator.setPolicy(policy);
            } else {
                throw new Error(
                    "Something went wrong while generating executable odrl policy"
                );
            }
        } catch (error: any) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }
}
const pdp = PolicyDecisionPoint.getSingleton();

export { pdp };
