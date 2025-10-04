import jwt from 'jsonwebtoken';

export const signAuthToken = (payload, secret, expiresIn) =>
    jwt.sign(payload, secret, {expiresIn});
