const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

const User = mongoose.model('User');

module.exports = function (passport) {
    // Configure the Google strategy
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        function (accessToken, refreshToken, profile, done) {
            // Unlike a local strategy, we can create a user here because Google
            // returns information about a user that we need that would otherwise require
            // a registration form
            User.findOne({ googleId: profile.id }).then((err, user) => {
                if (err) {
                    return done(err);
                }

                if (user) {
                    return done(null, user);
                } else {
                    const newUser = {
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        picture: profile.photos[0].value
                    }

                    let user = new User(newUser)
                    user.save().then((user) => {
                        return done(null, user);
                    }).catch((err) => {
                        return done(err);
                    });
                }
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};
