import { gql } from 'apollo-server-express';
import { IContext } from '@gql/index';
import { authenticated } from '@libs/auth';

export const queryType = gql`
    type Query {
        hello: String
        user: User
    }
`;

export const queryResolver = {
    Query: {
        hello: () => 'world',
        user: authenticated(async function(_: any, __: any, context: IContext) {
            return context.currentUser;
        })
    }
};
