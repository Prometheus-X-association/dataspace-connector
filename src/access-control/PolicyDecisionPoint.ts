import {
    ActionType,
    PolicyInstanciator,
    PolicyEvaluator,
} from 'json-odrl-manager';
import { FetcherConfig, FetchingParams, PolicyFetcher } from './PolicyFetcher';
import { Logger } from '../libs/loggers';

export type PDPJson = {
    [key: string]: string | number | Date | object;
};

export class PolicyDecisionPoint {
    private policyInstanciator: PolicyInstanciator;
    private policyEvaluator: PolicyEvaluator;
    private policyFetcher: PolicyFetcher;

    public constructor(config: FetcherConfig) {
        this.policyInstanciator = new PolicyInstanciator();
        this.policyEvaluator = new PolicyEvaluator();
        this.policyFetcher = new PolicyFetcher(config);
    }

    public setOptionalFetchingParams(params: FetchingParams): void {
        this.policyFetcher.setOptionalFetchingParams(params);
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
    public async addReferencePolicy(json: PDPJson): Promise<void> {
        try {
            json['@type'] = 'Offer';
            json['@context'] = 'https://www.w3.org/ns/odrl/2/';
            const policy = this.policyInstanciator.genPolicyFrom(json);
            if (policy) {
                const valid = await policy.validate();
                if (!valid) {
                    throw new Error(
                        '[PDP/addReferencePolicy]: Policy not valid'
                    );
                }
                this.policyEvaluator.addPolicy(policy, this.policyFetcher);
            } else {
                throw new Error(
                    '[PDP/addReferencePolicy]: Something went wrong while generating executable odrl policy'
                );
            }
        } catch (error) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }

    /**
     * listResourceLeftOperands - Retrieve an array of left operand associated to a given target.
     * @returns {Promise<string[]>} - A promise resolved when the reference policy is successfully set.
     * @param target
     */
    public async listResourceLeftOperands(target: string): Promise<string[]> {
        return await this.policyEvaluator.listLeftOperandsFor(target);
    }

    public log(): void {
        this.policyEvaluator.logPolicies();
    }
}
