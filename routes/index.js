const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth.js');

// Run the code in Story.js (no exports)
require('../models/Story.js');

// Retrieve the Story model
const Story = mongoose.model('Story');

// Run the code in User.js (no exports)
require('../models/User.js');

// Retrieve the User model that was defined by running User.js
const User = mongoose.model('User');

// Get request route handler for the / path (i.e. the welcome page)
router.get('/', ensureGuest, (req, res) => {
    res.render('index/welcome');
});

// Get request route handler for the /dashboard path (i.e. a user's personal dashboard)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Story.find({ user: req.user._id }).lean().then((stories) => {
        res.render('index/dashboard', {
            showDashboardHeader: true,
            stories: stories
        });
    }).catch((e) => {
        req.flash('error_message', 'There was an issue processing the request. Please try again later.');
        res.redirect('/stories');
    });
});

// Get request route handler for the /dashboard/:id path (i.e. a user's public facing dashboard or profile page)
router.get('/dashboard/:id', (req, res) => {
    if (req.user && (String(req.user._id) == req.params.id)) {
        res.redirect('/dashboard');
    } else {
        User.findOne({ _id: req.params.id }).lean().then((user) => {
            const userInfo = {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                picture: user.picture,
                fullName: user.firstName + ' ' + user.lastName
            };
            return userInfo;
        }).then((userInfo) => {
            Story.find({ user: userInfo._id, status: 'public' }).lean().then((stories) => {
                res.render('index/dashboard', {
                    showDashboardHeader: true,
                    stories: stories,
                    secondaryUser: userInfo
                });
            });
        }).catch((e) => {
            req.flash('error_message', 'There was an issue processing the request. Please try again later.');
            res.redirect('/stories');
        });
    }
});

module.exports = router;