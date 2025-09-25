import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';
import { getSecretKey, getServiceKey } from '../loaders/configuration';
import { Logger } from '../loggers';
import { Configuration } from '../../utils/types/configuration';

/**
 * Refreshes the authorization bearer token
 * @param refreshToken The input refresh token to verify
 */
export const refreshToken = async (refreshToken: string) => {
    try {
        const payload = await verifyToken(refreshToken);

        return await refreshTokenFromServiceKey(
            payload?.serviceKey?.toString()
        );
    } catch (error) {
        throw new Error('Invalid or Expired Refresh Token');
    }
};

/**
 * Regenerate the authorization bearer token
 * @param refreshToken The input refresh token to verify
 */
export const regenerateToken = async (refreshToken: string) => {
    try {
        const payload = await verifyToken(refreshToken);

        return await refreshTokensFromServiceKey(
            payload?.serviceKey?.toString()
        );
    } catch (error) {
        throw new Error('Invalid or Expired Refresh Token');
    }
};

/**
 * Verifies the authorization bearer token
 * @param token authorization bearer token
 */
export const verifyToken = async (token: string): Promise<any | string> => {
    try {
        return jwt.verify(token, await getSecretKey());
    } catch (error) {
        Logger.error({ message: error.message, location: 'verifyToken' });
    }
};

/**
 * Verifies the authorization bearer token
 * @param token authorization bearer token
 */
export const verifyPDIToken = async (token: string) => {
    try {
        const configuration = await Configuration.findOne({});

        const verify = configuration.modalOrigins.find(
            (el) => el.jwt === token
        );

        if (verify) {
            return jwt.verify(token, await getSecretKey());
        }
    } catch (error) {
        Logger.error(error);
    }
};

/**
 * Generates a token and a refresh token from a serviceKey
 * @param serviceKey
 */
export const refreshTokenFromServiceKey = async (serviceKey: string) => {
    const token = jwt.sign(
        {
            serviceKey: serviceKey,
            iat: new Date().getTime(),
        },
        await getSecretKey(),
        { expiresIn: Number.parseInt(config.jwtBearerTokenExpiration) }
    );

    return { token };
};

/**
 * Generates a token and a refresh token from a serviceKey
 * @param serviceKey
 */
export const refreshTokensFromServiceKey = async (serviceKey: string) => {
    const token = jwt.sign(
        {
            serviceKey: serviceKey,
            iat: new Date().getTime(),
        },
        await getSecretKey(),
        { expiresIn: Number.parseInt(config.jwtBearerTokenExpiration) }
    );

    const refreshToken = jwt.sign(
        {
            serviceKey: serviceKey,
            iat: new Date().getTime(),
        },
        await getSecretKey(),
        { expiresIn: config.jwtRefreshTokenExpiration }
    );

    return { token, refreshToken };
};

/**
 * Generates a token and a refresh token for a participant automatically
 */
export const generateBearerTokenFromSecret = async () => {
    const token = jwt.sign(
        {
            serviceKey: await getServiceKey(),
            iat: new Date().getTime(),
        },
        await getSecretKey(),
        { expiresIn: Number.parseInt(config.jwtBearerTokenExpiration) }
    );

    const refreshToken = jwt.sign(
        {
            serviceKey: await getServiceKey(),
            iat: new Date().getTime(),
        },
        await getSecretKey(),
        { expiresIn: config.jwtRefreshTokenExpiration }
    );

    return { token, refreshToken };
};

/**
 * Generate token from given serviceKey and secret Key
 * @param serviceKey
 * @param secretKey
 */
export const generateBearerTokenForLoginRoutes = async (
    serviceKey: string,
    secretKey: string
) => {
    const token = jwt.sign(
        {
            serviceKey: serviceKey,
            iat: new Date().getTime(),
        },
        secretKey,
        { expiresIn: Number.parseInt(config.jwtBearerTokenExpiration) }
    );

    const refreshToken = jwt.sign(
        {
            serviceKey: serviceKey,
            iat: new Date().getTime(),
        },
        secretKey,
        { expiresIn: config.jwtRefreshTokenExpiration }
    );

    return { token, refreshToken };
};

/**
 * Generate a token for PDI
 * @param serviceKey
 * @param origin
 * @param secretKey
 */
export const generateBearerTokenForPDI = async (
    serviceKey: string,
    origin: string,
    secretKey: string
) => {
    const token = jwt.sign(
        {
            serviceKey: serviceKey,
            origin,
            iat: new Date().getTime(),
        },
        secretKey
    );

    return { token };
};