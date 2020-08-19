const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config();
const app = express();
const authRouter = require('./routes/auth.js');
const port = process.env.PORT || 3000;

// Get the appropriate database uri (development, testing, or production)
const mongoURI = require('./config/database.js').mongoURI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected ...'))
    .catch(err => console.log(err));

// Create a session middleware
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));

// Configure the strategies used by Passport
require('./config/passport.js')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Mount the router module for auth on the /auth path in the main app
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
