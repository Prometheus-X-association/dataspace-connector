import {
    ActionType,
    PolicyInstanciator,
    PolicyEvaluator,
} from "json-odrl-manager";
import { FetcherConfig, PolicyFetcher } from "./PolicyFetcher";
import { Logger } from "../libs/loggers/Logger";

export class PolicyDecisionPoint {
    private policyInstanciator: PolicyInstanciator;
    private policyEvaluator: PolicyEvaluator;
    private policyFetcher: PolicyFetcher;

    public constructor(config: FetcherConfig) {
        this.policyInstanciator = new PolicyInstanciator();
        this.policyEvaluator = new PolicyEvaluator();

        this.policyFetcher = new PolicyFetcher(config);
        this.policyEvaluator.setFetcher(this.policyFetcher);
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
    ): Promise<boolean> {
        const isPerformable = await this.policyEvaluator.isActionPerformable(
            action,
            target
        );
        return isPerformable;
    }

    /**
     * setReferencePolicy - Sets the reference ODRL policy for evaluation.
     * @param {Object} json - The JSON representation of the ODRL policy.
     * @returns {Promise<void>} - A promise resolved when the reference policy is successfully set.
     */
    public async addReferencePolicy(json: any): Promise<void> {
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
