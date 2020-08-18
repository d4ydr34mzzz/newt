const express = require('express');
const passport = require('passport');
const router = express.Router();

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