const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');

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
            console.log(accessToken);
            console.log(profile);
        }
    ));
}
