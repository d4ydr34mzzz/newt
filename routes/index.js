const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth.js');

// Run the code in Story.js (no exports)
require('../models/Story.js');

// Retrieve the Story model
const Story = mongoose.model('Story');

router.get('/', ensureGuest, (req, res) => {
    res.render('index/welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Story.find({ user: req.user._id }).lean().then((stories) => {
        res.render('index/dashboard', {
            dashboardHeader: true,
            stories: stories
        });
    }).catch((e) => {
        req.flash('error_message', 'There was an issue processing the request. Please try again later.');
        res.redirect('/stories');
    });
});

module.exports = router;