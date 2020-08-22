const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth.js');

// Run the code in Story.js (no exports)
require('../models/Story.js');

// Retrieve the Story model
const Story = mongoose.model('Story');

router.get('/', (req, res) => {
    Story.find({ status: 'public' }).populate('user').lean().then((stories) => {
        res.render('stories/index', {
            stories: stories
        });
    });
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

router.post('/', ensureAuthenticated, (req, res) => {

    // TODO: Handle errors in the form submission before saving anything to the database
    // TODO: Is it ok to save the Delta object directly to a document?

    let allowComments = false;

    if (req.body.allowComments) {
        allowComments = true;
    }

    const newStory = {
        title: req.body.title,
        bodyText: req.body.storyText,
        bodyDelta: req.body.storyDelta,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id
    }

    console.log(newStory);
    
    new Story(newStory).save().then((story) => {
        res.redirect(`/stories/show/${story.id}`);
    });
});

module.exports = router;