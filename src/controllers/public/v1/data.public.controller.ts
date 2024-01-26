import { Request, Response, NextFunction } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Logger } from '../../../libs/loggers';
import { validateConsent } from '../../../utils/validateConsent';
import axios from 'axios';

export const exportData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { signedConsent, encrypted } = req.body;

        if (!signedConsent || !encrypted)
            return res.status(400).json({
                error: 'Missing params from request payload',
            });

        // Send OK response to requester
        res.status(200).json({ message: 'OK' });

        // Decrypt signed consent and retrieve token + consentId
        const decryptedConsent = decryptSignedConsent(signedConsent, encrypted);

        // Send validation verification to VisionsTrust to receive user info and DataTypes
        const validation = await validateConsent(signedConsent, encrypted);

        // Gather data from your datablase using validation data
        // userExport has both email and userServiceId to know which user it is

        //eslint-disable-next-line
        const { verified } =
            validation;

        if (!verified) {
            throw new Error('consent not verified.');
        }

        //TODO:PEP
        // const pep = await PEP.requestAction({
        //     action: 'use',
        //     targetResource: 'dataExchange.resourceId',
        //     referenceURL: 'dataExchange.contract',
        //     referenceDataPath: dataExchange.contract.includes('contracts')
        //         ? 'rolesAndObligations.policies'
        //         : 'policy',
        //     fetcherConfig: {},
        // });

        const serviceOfferingSD = await axios.get(
            (decryptedConsent as any).data[0]
        );

        const dataResourceSD = await axios.get(
            (serviceOfferingSD.data as any).dataResources[0]
        );

        // Define a regular expression pattern
        const regex = /{([^}]*)}/g;

        // Use the replace method with a callback function to replace the text between "{ }"
        const url = dataResourceSD.data.representation.url.replace(
            regex,
            () => {
                return (decryptedConsent as any).providerUserIdentifier
                    .identifier;
            }
        );

        const data = await axios.get(url);

        // POST the data to the import service
        await axios({
            url: (decryptedConsent as any).dataConsumer.endpoints.dataImport,
            method: 'POST',
            data: {
                data: data.data,
                user: (decryptedConsent as any).consumerUserIdentifier
                    .identifier,
                signedConsent: signedConsent,
                encrypted,
            },
        });
    } catch (err) {
        Logger.error({
            message: err,
            location: 'data export',
        });
        // next(err);
    }
};

export const importData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //eslint-disable-next-line
        const { data, user, signedConsent, encrypted } = req.body;
        const errors = [];
        if (!signedConsent) errors.push('missing signedConsent');
        if (!data) errors.push('missing data');
        if (!user) errors.push('missing user');

        if (errors.length > 0)
            return res
                .status(400)
                .json({ error: 'missing params from request payload', errors });

        res.status(200).json({ message: 'OK' });

        //TODO:PEP
        // const pep = await PEP.requestAction({
        //     action: 'use',
        //     targetResource: 'dataExchange.resourceId',
        //     referenceURL: 'dataExchange.contract',
        //     referenceDataPath: dataExchange.contract.includes('contracts')
        //         ? 'rolesAndObligations.policies'
        //         : 'policy',
        //     fetcherConfig: {},
        // });

        //eslint-disable-next-line
        const decryptedConsent = decryptSignedConsent(signedConsent, encrypted);

        const serviceOffering = decryptedConsent.purposes[0].purpose;

        const serviceOfferingSD = await axios.get(serviceOffering);

        const softwareResourceSD = await axios.get(
            serviceOfferingSD.data.softwareResources[0]
        );

        const representationUrl = softwareResourceSD.data.representation.url;
        const regex = /{([^}]*)}/g;
        if (representationUrl.match(regex)) {
            if (data._id) delete data._id;

            const url = representationUrl.replace(regex, () => {
                return user;
            });
            await axios.put(url, data);
        } else {
            await axios.post(representationUrl, data);
        }
    } catch (err) {
        Logger.error(err);
    }
};
