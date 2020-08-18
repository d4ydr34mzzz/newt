const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();
const app = express();
const authRouter = require('./routes/auth.js');
const port = process.env.PORT || 3000;

// Configure the strategies used by Passport
require('./config/passport.js')(passport);

// Passport middleware
app.use(passport.initialize());
// app.use(passport.session());

// Mount the router module for auth on the /auth path in the main app
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
