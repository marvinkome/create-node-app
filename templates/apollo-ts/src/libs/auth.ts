import passport from 'passport';
import { Strategy } from 'passport-local';
import { Document } from 'mongoose';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import jwt from 'express-jwt';

import { IContext } from '@gql/index';
import User, { IUser } from '@models/users';

export function setup_auth() {
    passport.use(
        new Strategy(
            {
                usernameField: 'identifier'
            },
            async (identifier, password, done) => {
                // check if it's an email or username
                const isEmail = /\S+@\S+\.\S+/.test(identifier);
                let user: Document | null = null;

                if (isEmail) {
                    user = await User.findOne({ email: identifier });
                } else {
                    user = await User.findOne({ username: identifier });
                }

                // @ts-ignore
                if (!user || !(await user.verify_password(password))) {
                    return done(null, false, {
                        message: 'email or password is invalid'
                    });
                }

                return done(null, user);
            }
        )
    );
}

export function getTokenFromHeaders(req: Request) {
    const auth = req.headers.authorization;

    if (auth && auth.split(' ')[0] === 'Bearer') {
        return auth.split(' ')[1];
    }

    return null;
}

export async function getUserFromToken(token: string): Promise<IUser> {
    // decode token
    let payload: any = null;
    try {
        payload = verify(token, process.env.SECRET_KEY || '');
    } catch (e) {
        throw Error('invalid token');
    }

    // get user
    const user = await User.findById(payload.id);
    if (!user) {
        throw Error(`user not found`);
    }

    return user;
}

export function authenticated(next: (...args: any[]) => any) {
    return (root: any, args: any, context: IContext, info: any) => {
        if (!context.currentUser) {
            throw new Error('Unauthenticated');
        }

        return next(root, args, context, info);
    };
}

export default {
    required: jwt({
        secret: process.env.SECRET_KEY || '',
        userProperty: 'payload',
        getToken: getTokenFromHeaders
    }),
    optional: jwt({
        secret: process.env.SECRET_KEY || '',
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
        credentialsRequired: false
    })
};
