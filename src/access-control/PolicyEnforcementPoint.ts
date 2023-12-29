import { Logger } from "../libs/loggers/Logger";
import { PolicyDecisionPoint } from "./PolicyDecisionPoint";
export type AccessRequest = {
    /*
     * Contract id
     */
    contract: string;
    /*
     * Requested action
     */
    action: string;
    /*
     * Resource uid
     */
    target: string;
    /*
     * Request method used to retrieve the reference policy
     */
    method: string;
};

/**
 * enforcePolicy - Enforces the access policy by querying the Policy Decision Point (PDP) with the provided request.
 * @param {AccessRequest} request - The access request to be evaluated by the PDP.
 * @returns {Promise<void>} - A promise resolved when the policy enforcement is complete.
 */
export const enforcePolicy = async (request: AccessRequest): Promise<void> => {
    try {
        // Todo
        const config = {};
        const pdp = new PolicyDecisionPoint(config);
        const hasPermission = await queryPdp(pdp, request);
        if (!hasPermission) {
            throw new Error("Resquest can't be made on requested resource");
        }
    } catch (error: any) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
    }
};

/**
 * queryPdp - Queries the Policy Decision Point (PDP) to evaluate an access request.
 * @param {AccessRequest} request - The request to be evaluated.
 * @returns {Promise<boolean>} - A promise resolved to true if the access is permitted, false otherwise.
 */
async function queryPdp(
    pdp: PolicyDecisionPoint,
    request: AccessRequest
): Promise<boolean> {
    try {
        const method = request.method.toLowerCase();
        switch (method) {
            case "post":
                break;
        }
        // Todo
        pdp.setReferencePolicy({});
        pdp.queryResource(request.action, request.target);
        return true;
    } catch (error) {
        throw new Error(`Failed during pdp evaluation: ${error.message}`);
    }
}
