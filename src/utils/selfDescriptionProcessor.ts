import {IDataExchange} from "./types/dataExchange";

/**
 * Manage compatibility between the target and the contract given to the PEP verification to enable backward compatibility
 * @param target
 * @param dataExchange
 * @param contractURL
 * @param contract
 * @return string
 */
export const selfDescriptionProcessor = (target: string, dataExchange: IDataExchange, contractURL: string, contract: any) => {
    let returnTarget: string;
    //Bilateral case
    if (contractURL.includes('bilaterals')) {
        //flatten policy to analyse target format
        const targets = contract?.policy.map((p: { permission: any; }) => p.permission.map((per: { target: any; }) => per.target)).flat();

        returnTarget = assignRightTarget(targets, target);
    }
    // Ecosystem case
    else if (contractURL.includes('contracts')) {
        const targets = contract?.serviceOfferings.map((p: { policies: any; }) => p.policies.map((policy: { permission: any; }) => policy.permission.map((per: { target: any; }) => per.target)).flat()).flat();
        returnTarget = assignRightTarget(targets, target);
    }

    return returnTarget
}

const assignRightTarget = (targets: string[], target: string) => {
    const httpPattern = /^https?:\/\//;
    let returnTarget: string;
    if(targets && targets.length > 0 && targets.includes(target)){
        returnTarget = target;
    } else if(!targets.includes(target) && httpPattern.test(target)) {
        const pathElements = target.split('/');
        const splitTarget = pathElements[pathElements.length - 1];
        if (targets.includes(pathElements[pathElements.length - 1])) returnTarget = splitTarget;
    } else {
        returnTarget = target
    }
    return returnTarget;
}