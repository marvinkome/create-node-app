import express from 'express';
import path from 'path';
import createApp from './src';

const { app, apolloServer } = createApp();
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/build')));
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`🚀 App is running on localhost:${port}`);

    console.log(
        `🚀 GraphQL server running on localhost:${port}${
            apolloServer.graphqlPath
        }`
    );
});
