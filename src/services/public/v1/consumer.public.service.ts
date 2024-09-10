import { DataExchange } from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { pepVerification } from '../../../utils/pepVerification';
import { getCatalogData } from '../../../libs/services/catalog';
import { handle } from '../../../libs/loaders/handler';
import axios from 'axios';
import { Logger } from '../../../libs/loggers';
import {
    postRepresentation,
    putRepresentation,
} from '../../../libs/loaders/representationFetcher';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Regexes } from '../../../utils/regexes';
import { User } from '../../../utils/types/user';

interface ImportDataParams {
    data: any;
    user: any;
    signedConsent: string;
    encrypted: string;
    apiResponseRepresentation: any;
    isPayload: boolean;
    resource: any;
}

/**
 * Post or Put data to given representation
 * @param params
 * @return Promise<any>
 */
const postOrPutRepresentation = async (params: {
    decryptedConsent?: any;
    representationUrl: string;
    data: any;
    method: string;
    credential: string;
    user: any;
}) => {
    // if contains params in URL is PUT Method
    if (params.representationUrl.match(Regexes.userIdParams)) {
        if (params.data._id) delete params.data._id;

        // replace params between {} by id in consent
        const url = params.representationUrl.replace(
            Regexes.userIdParams,
            () => {
                return params.user;
            }
        );

        const [updateData] = await handle(
            putRepresentation(
                params.method,
                url,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return updateData;
    } else if (params.representationUrl.match(Regexes.urlParams)) {
        const user = await User.findOne({ internalID: params.user }).lean();
        // replace params between {url} by id in consent
        const url = params.representationUrl.replace(Regexes.urlParams, () => {
            return user.url;
        });

        const [postData] = await handle(
            postRepresentation(
                params.method,
                url,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return postData;
    }
    //else we POST data
    else {
        const [postData] = await handle(
            postRepresentation(
                params.method,
                params.representationUrl,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return postData;
    }
};

export const importDataService = async ({
    data,
    user,
    signedConsent,
    encrypted,
    apiResponseRepresentation,
    isPayload,
    resource,
}: ImportDataParams) => {
    try {
        const decryptedConsent = await decryptSignedConsent(
            signedConsent,
            encrypted
        );
        const dataExchange = await DataExchange.findOne({
            providerDataExchange: decryptedConsent.providerDataExchangeId,
        });

        let pepResult: any = { success: true };

        if (decryptedConsent.contract.includes('contracts')) {
            pepResult = await pepVerification({
                targetResource: decryptedConsent.purposes[0].serviceOffering,
                referenceURL: decryptedConsent.contract,
            });
        }

        if (pepResult.success) {
            if (isPayload) {
                const [dataResourceSD] = await handle(getCatalogData(resource));

                await postOrPutRepresentation({
                    decryptedConsent,
                    method: dataResourceSD?.apiResponseRepresentation?.method,
                    representationUrl:
                        dataResourceSD?.apiResponseRepresentation.url,
                    data,
                    credential:
                        dataResourceSD?.apiResponseRepresentation?.credential,
                    user,
                });
            } else {
                const [softwareResourceSD] = await handle(
                    getCatalogData(decryptedConsent.purposes[0].resource)
                );

                const payload = await postOrPutRepresentation({
                    decryptedConsent,
                    method: softwareResourceSD.representation?.method,
                    representationUrl: softwareResourceSD.representation.url,
                    data,
                    credential: softwareResourceSD.representation?.credential,
                    user,
                });

                if (softwareResourceSD.isAPI && apiResponseRepresentation) {
                    await axios({
                        url: (decryptedConsent as any).dataProvider.endpoints
                            .dataImport,
                        method: 'POST',
                        data: {
                            data: payload,
                            user: (decryptedConsent as any)
                                .providerUserIdentifier.identifier,
                            signedConsent: signedConsent,
                            encrypted,
                            resource,
                            isPayload: true,
                        },
                    });
                }
            }
            await dataExchange.updateStatus(
                DataExchangeStatusEnum.IMPORT_SUCCESS
            );
        } else {
            await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR);
        }

        return { success: true };
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return { success: false, error: err.message };
    }
};
