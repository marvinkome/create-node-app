import express from 'express';
import { connect } from 'mongoose';
import bodyParser from 'body-parser';

import apolloServer from '@gql/index';
import { setup_auth } from '@libs/auth';
import routes from '@routes/index';

export default function createApp() {
    const app = express();

    // setup mongoose
    // @ts-ignore
    const mongoUrl = process.env.MONGO_URL + process.env.DATABASE_NAME;
    connect(
        mongoUrl,
        {
            useNewUrlParser: true,
            useCreateIndex: true
        }
    );

    // body parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // setup graphql
    apolloServer.applyMiddleware({ app });

    // setup passport
    setup_auth();

    // api routes
    app.use('/api', routes);

    return { app, apolloServer };
}
