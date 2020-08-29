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
    Story.find({ status: 'public' }).populate('user').lean().sort({ date: 'desc' }).then((stories) => {
        res.render('stories/index', {
            stories: stories,
            publicStoriesPage: true
        });
    });
});

// Get request route handler for the /stories/show/:id path (i.e. the show story page for a story with id)
router.get('/show/:id', (req, res) => {
    Story.findOne({ _id: req.params.id }).populate('user').populate('comments.commentUser').lean().then((story) => {
        if (story.status == 'public') {
            res.render('stories/show', {
                useGreyBackground: true,
                story: story
            });
        } else if (story.status == 'private') {
            if (req.user) {
                if (String(req.user._id) !== String(story.user._id)) {
                    res.redirect('/stories');
                } else {
                    res.render('stories/show', {
                        useGreyBackground: true,
                        story: story
                    });
                }
            } else {
                res.redirect('/stories');
            }
        }
    }).catch((e) => {
        req.flash('error_message', 'There was an issue processing the request. Please try again later.');
        res.redirect('/stories');
    });
});

// Get request route handler for the /stories/edit/:id path (i.e. the edit story page for a story for with id)
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    class UnauthorizedRequestError extends Error {
        constructor(...params) {
            super(...params);
            this.name = "UnauthorizedRequestError";
        }
    }

    Story.findOne({ _id: req.params.id, user: req.user._id }).lean().then((story) => {
        if (!story) {
            throw new UnauthorizedRequestError();
        }

        res.render('stories/edit', {
            story: story
        });
    }).catch((e) => {
        if (e instanceof UnauthorizedRequestError) {
            req.flash('error_message', 'Not authorized');
            res.redirect('/stories');
        } else {
            req.flash('error_message', 'There was an issue processing the request. Please try again later.');
            res.redirect('/dashboard');
        }
    });
});

// Get request route handler for the /stories/add path
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

// Post request route handler for the /stories path
router.post('/', ensureAuthenticated, (req, res) => {

    // TODO: Is it ok to save the Delta object directly to a document?

    let errors = [];

    if (!req.body.title) {
        errors.push({ msg: 'Please add a title' });
    }

    if (!req.body.checkStory) {
        errors.push({ msg: 'Please add a story body' });
    }

    if (!req.body.status) {
        errors.push({ msg: 'Please set the story status' });
    }

    if (errors.length > 0) {
        res.render('stories/add', {
            title: req.body.title,
            storyText: req.body.storyText,
            status: req.body.status,
            allowComments: req.body.allowComments,
            form_validation_error_messages: errors
        });
    } else {
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

        new Story(newStory).save().then((story) => {
            req.flash('success_message', 'Story published');
            res.redirect(`/stories/show/${story._id}`);
        }).catch((e) => {
            // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
            req.flash('error_message', 'There was an issue processing the request. Please try again later.');
            res.redirect('/dashboard');
        });
    }
});

// Post request route handler for the /stories/comment/:id path (i.e. comments under a story with id)
router.post('/comment/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({ _id: req.params.id }).then((story) => {
        if (story.status == 'private') {
            if (String(req.user._id) !== String(story.user._id)) {
                throw new Error();
            }
        }

        if(!story.allowComments){
            throw new Error();
        }
        
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user._id
        }

        // Unshifting new comments will make it so that the newest comments are at the top.
        story.comments.unshift(newComment);
        return story.save();
    }).then((story) => {
        res.redirect(`/stories/show/${req.params.id}`);
    }).catch((e) => {
        req.flash('error_message', 'There was an issue processing the request. Please try again later.');
        res.redirect(`/stories/show/${req.params.id}`);
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

        if (!req.body.checkStory) {
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
        req.flash('success_message', 'Story updated');
        res.redirect(`/stories/show/${req.params.id}`);
    }).catch((e) => {
        if (e instanceof UnauthorizedRequestError) {
            req.flash('error_message', 'Not authorized');
            res.redirect('/');
        } else if (e instanceof FormValidationError) {
            // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
            req.flash('form_validation_error_messages', e.errors);
            res.redirect(`/stories/edit/${req.params.id}`);
        } else {
            // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
            req.flash('error_message', 'There was an issue processing the request. Please try again later.');
            res.redirect(`/stories/edit/${req.params.id}`);
        }
    });
});

// Delete request route handler for the /stories path
router.delete('/:id', (req, res) => {
    class UnauthorizedRequestError extends Error {
        constructor(...params) {
            super(...params);
            this.name = "UnauthorizedRequestError";
        }
    }

    Story.deleteOne({ _id: req.params.id, user: req.user._id }).then((story) => {
        if (!story.deletedCount) {
            throw new UnauthorizedRequestError();
        }

        req.flash('success_message', 'Story removed');
        res.redirect('/dashboard');
    }).catch((e) => {
        if (e instanceof UnauthorizedRequestError) {
            req.flash('error_message', 'Not authorized');
            res.redirect('/stories');
        } else {
            // TODO: Ideally, the user would be shown this message without the redirect causing their work to be lost!
            req.flash('error_message', 'There was an issue processing the request. Please try again later.');
            res.redirect(`/stories/edit/${req.params.id}`);
        }
    });
});

module.exports = router;