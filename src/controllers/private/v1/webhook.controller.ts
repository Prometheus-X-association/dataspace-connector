import { Request, Response, NextFunction } from 'express';
import { User } from '../../../utils/types/user';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getSecretKey } from '../../../libs/loaders/configuration';
import { Logger } from '../../../libs/loggers';

/**
 * Receives a userIdentifier from the consent-manager after the guardian has
 * validated the guardianship request. Updates the local user record.
 *
 * Security: the consent-manager includes the participant's clientSecret in the
 * X-Webhook-Secret header. We verify it against our own secretKey.
 */
export const webhookUserIdentifier = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const secret = req.headers['x-webhook-secret'] as string;
        const expectedSecret = await getSecretKey();

        if (!secret || secret !== expectedSecret) {
            return restfulResponse(res, 401, { message: 'Unauthorized' });
        }

        const { event, userIdentifier } = req.body;

        if (event !== 'userIdentifierCreated' || !userIdentifier?._id) {
            return restfulResponse(res, 400, { message: 'Invalid webhook payload' });
        }

        const user = await User.findOne({
            email: userIdentifier.email,
            pendingGuardianship: true,
        });

        if (!user) {
            Logger.error({
                location: 'webhookUserIdentifier',
                message: `No pending user found for email: ${userIdentifier.email}`,
            });
            return restfulResponse(res, 404, { message: 'Pending user not found' });
        }

        user.userIdentifier = userIdentifier._id;
        user.pendingGuardianship = false;
        await user.save();

        Logger.info({
            location: 'webhookUserIdentifier',
            message: `UserIdentifier set for ${userIdentifier.email}: ${userIdentifier._id}`,
        });

        return restfulResponse(res, 200, { message: 'UserIdentifier stored' });
    } catch (err) {
        next(err);
    }
};
