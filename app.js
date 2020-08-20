const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const exhbs = require('express-handlebars');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config();
const app = express();
const indexRouter = require('./routes/index.js');
const authRouter = require('./routes/auth.js');
const port = process.env.PORT || 3000;

// Specify the location of the public folder to serve static assets
app.use(express.static(path.join(__dirname, 'public')));

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

// Custom middleware to expose request-level information using res.locals
app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

//Set handlebars as the template engine to use with Express
app.engine('handlebars', exhbs());
app.set('view engine', 'handlebars');

// Mount the router module for index on the / path in the main app
app.use('/', indexRouter);

// Mount the router module for auth on the /auth path in the main app
app.use('/auth', authRouter);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
