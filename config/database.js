if (process.env.NODE_ENV === 'production') {
    module.exports = { mongoURI: '' };
} else if (process.env.NODE_ENV === 'testing') {
    module.exports = { mongoURI: '' };
} else {
    module.exports = { mongoURI: `mongodb+srv://${process.env.DB_DEV_USER}:${process.env.DB_DEV_PASSWORD}@storybooks-dev.4zr7p.mongodb.net/${process.env.DB_DEV_NAME}?retryWrites=true&w=majority` };
}