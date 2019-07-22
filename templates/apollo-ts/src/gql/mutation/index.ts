import { gql } from 'apollo-server-express';

export const mutationType = gql`
    type Mutation {}
`;

export const mutationResolvers = {
    Mutation: {}
};
