const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();

// Run the code in User.js (no exports)
require('../models/User.js');

// Retrieve the User model that was defined by running User.js
const User = mongoose.model('User');

// Route path for Google OAuth 2.0
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Route path Google will redirect the user to after authorization.
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

module.exports = router;