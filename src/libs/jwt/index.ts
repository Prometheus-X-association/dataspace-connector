import jwt from "jsonwebtoken";
import { config } from "../../config/environment";

/**
 * Generates a token and a refresh token for a user
 * @param userId sub of the jwt
 */
export const generateBearerToken = (userId: string) => {
    const token = jwt.sign({ sub: userId }, config.jwtSecretKey, {
        expiresIn: config.jwtBearerTokenExpiration,
    });

    const refreshToken = jwt.sign({ sub: userId }, config.jwtSecretKey, {
        expiresIn: config.jwtRefreshTokenExpiration,
    });

    return { token, refreshToken };
};

/**
 * Generates a token for the client user's session
 * TODO make a env var for client session token expiration
 */
export const generateSessionToken = (userId: string) => {
    return generateBearerToken(userId);
};

/**
 * Refreshes the authorization bearer token
 * @param refreshToken The input refresh token to verify
 */
export const refreshToken = (refreshToken: string) => {
    try {
        const payload = jwt.verify(refreshToken, config.jwtSecretKey);
        return generateBearerToken(payload.sub?.toString());
    } catch (error) {
        throw new Error("Invalid or Expired Refresh Token");
    }
};

/**
 * Verifies the authorization bearer token
 * @param token authorization bearer token
 */
export const verifyToken = (token: string) => {
    return jwt.verify(token, config.jwtSecretKey);
};
