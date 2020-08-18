const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    googleId: {
        type: String,
        // Making it a required key because it's the only authentication that
        // will be used for this project
        required: true
    },
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    picture: {
        type: String
    }
});

// Convert the schema into a model we can work with
mongoose.model('User', userSchema);