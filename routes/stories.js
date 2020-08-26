const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth.js');

// Run the code in Story.js (no exports)
require('../models/Story.js');

// Retrieve the Story model
const Story = mongoose.model('Story');

// Get request route handler for the /stories path (i.e. the public stories page)
router.get('/', (req, res) => {
    Story.find({ status: 'public' }).populate('user').lean().then((stories) => {
        res.render('stories/index', {
            stories: stories
        });
    });
});

// Get request route handler for the /stories/show/:id path (i.e. the show story page for a story with id)
router.get('/show/:id', (req, res) => {
    Story.findOne({ _id: req.params.id }).populate('user').lean().then((story) => {
        res.render('stories/show', {
            useGreyBackground: true,
            story: story
        });
    }).catch((e) => {
        // TODO: Have a flash message saying there was an issue retrieving the specified story on the frontend
        console.log(e);
        res.redirect('/stories/my');
    });
});

// Get request route handler for the /stories/edit/:id path (i.e. the edit story page for a story for with id)
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({ _id: req.params.id }).lean().then((story) => {
        res.render('stories/edit', {
            story: story
        });
    }).catch((e) => {
        console.log(e);
        res.redirect('/stories/my');
    });
});

// Get request route handler for the /stories/add path
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

// Post request route handler for the /stories path
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
        user: req.user._id
    }

    console.log(newStory);

    new Story(newStory).save().then((story) => {
        req.flash('success_msg', 'The story was published');
        res.redirect(`/stories/show/${story._id}`);
    }).catch((e) => {
        // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
        req.flash('error_message', 'There was an issue processing the request. Please try again later.');
        res.redirect('/');
    });
});

// Put request route handler for the /stories path
router.put('/:id', ensureAuthenticated, (req, res) => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    //            https://javascript.info/custom-errors
    class UnauthorizedRequestError extends Error {
        constructor(...params) {
            super(...params);
            this.name = "UnauthorizedRequestError";
        }
    }

    class FormValidationError extends Error {
        constructor(errors = [], ...params) {
            super(...params);
            this.name = "FormValidationError";
            this.errors = errors;
        }
    }

    Story.findOne({ _id: req.params.id, user: req.user._id }).then((story) => {
        if (!story) {
            throw new UnauthorizedRequestError();
        }

        // Server-side validation of the form input
        let errors = [];

        if (!req.body.title) {
            errors.push({ msg: 'Please add a title' });
        }

        if (!req.body.storyText) {
            errors.push({ msg: 'Please add a story body' });
        }

        if (!req.body.status) {
            errors.push({ msg: 'Please set the story status' });
        }

        if (errors.length > 0) {
            throw new FormValidationError(errors);
        }

        // Update the story
        let allowComments = false;

        if (req.body.allowComments) {
            allowComments = true;
        }

        story.title = req.body.title;
        story.bodyText = req.body.storyText;
        story.bodyDelta = req.body.storyDelta;
        story.status = req.body.status;
        story.allowComments = allowComments;
        return story.save();
    }).then((story) => {
        req.flash('success_msg', 'The story was succesfully updated');
        res.redirect('/stories/my');
    }).catch((e) => {
        if (e instanceof UnauthorizedRequestError) {
            req.flash('error_message', 'Not authorized');
            res.redirect('/');
        } else if (e instanceof FormValidationError) {
            // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
            req.flash('form_validation_error_msgs', e.errors);
            res.redirect(`/stories/edit/${req.params.id}`);
        } else {
            // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
            console.log('There was an issue processing the request. Please try again later.');
            res.redirect(`/stories/edit/${req.params.id}`);
        }
    });
});

module.exports = router;