import jwt from 'jsonwebtoken';

export const generateAuthToken = () => {
    const { serviceKey, secretKey } = process.env;
    return jwt.sign(
        {
            serviceKey: serviceKey,
        },
        secretKey,
        { expiresIn: 5 * 60 }
    );
};
