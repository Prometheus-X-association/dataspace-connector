import { Request, Response, NextFunction } from 'express';
import { validateConsent } from '../../../utils/validateConsent';
import { decryptSignedConsent } from '../../../utils/decryptConsent';

export const exportData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { signedConsent } = req.body;

        if (!signedConsent)
            return res.status(400).json({
                error: 'Missing signedConsent from request payload',
            });

        // Send OK response to requester
        res.status(200).json({ message: 'OK' });

        // Decrypt signed consent and retrieve token + consentId
        // const decryptedConsent = decryptSignedConsent(signedConsent);
        // const { consentId, token } = decryptedConsent;

        // [opt] verify token to match the one you generated (VisionsTrust will verify anyways)

        // Send validation verification to VisionsTrust to receive user info and DataTypes
        const validation = await validateConsent(signedConsent);

        // Gather data from your datablase using validation data
        // userExport has both email and userServiceId to know which user it is

        //eslint-disable-next-line
        const { userExport, userImport, dataImportEndpoint, datatypes } =
            validation;
        // const userData = getData(userExport, datatypes);

        // TODO: Write your own implementation here
        // MOCK EXAMPLE
        const userData = {};

        // POST the data to the import service
        // await axios({
        //     url: dataImportEndpoint,
        //     method: 'POST',
        //     data: {
        //         data: userData,
        //         user: userImport.userServiceId,
        //         signedConsent: signedConsent,
        //     },
        // });
    } catch (err) {
        next(err);
    }
};

export const importData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //eslint-disable-next-line
        const { data, user, signedConsent } = req.body;
        const errors = [];
        if (!signedConsent) errors.push('missing signedConsent');
        if (!data) errors.push('missing data');
        if (!user) errors.push('missing user');

        if (errors.length > 0)
            return res
                .status(400)
                .json({ error: 'missing params from request payload', errors });

        res.status(200).json({ message: 'OK' });

        // The user here is the userServiceId
        // In case you need the user email, you can decrypt the consent

        //eslint-disable-next-line
        const { emailImport } = decryptSignedConsent(signedConsent);

        // Now you can store the data for the appropriate user ID / email

        // TODO: Write your own implementation here
    } catch (err) {
        next(err);
    }
};
