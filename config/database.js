if (process.env.NODE_ENV === 'production') {
    module.exports = { mongoURI: `mongodb+srv://${process.env.DB_PROD_USER}:${process.env.DB_PROD_PASSWORD}@cluster0.qxs5v.mongodb.net/${process.env.DB_PROD_NAME}?retryWrites=true&w=majority`}
} else if (process.env.NODE_ENV === 'testing') {
    module.exports = { mongoURI: '' };
} else {
    module.exports = { mongoURI: `mongodb+srv://${process.env.DB_DEV_USER}:${process.env.DB_DEV_PASSWORD}@storybooks-dev.4zr7p.mongodb.net/${process.env.DB_DEV_NAME}?retryWrites=true&w=majority` };
}