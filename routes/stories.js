//This file contains main routes such as /dashboard

const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth')

//bring in the story model
const Story = require('../models/Story')

// @desc    Show add page
//@route    GET /stoies/add
//ensureAuth makes sure that only a user should be able to perform the action
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add',)
})
// @desc    Process the add form
//@route    POST /stoies
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Story.create(req.body)
        res.redirect('/dashboard')

    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
})

// @desc    Show all stories
//@route    GET /stoies
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            //populate with user model to get user data (not part of the story)
            .populate('user')
            .sort({ createdAt: 'desc'})
            //Allows us to pass into the template
            .lean()

        res.render('stories/index', {stories,})

    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
})

// @desc    Show single story
//@route    GET /stoies/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById( req.params.id)
        .populate('user')
        .lean()
        if (!story) {
            return res.render('error/404');
        }

        res.render('stories/show', {story})
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})

// @desc    Show edit page
//@route    GET /stoies/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()

        if (!story) {
            return res.render('error/404')
        }

        if(story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (err) {
        console.error(err);
        res.render('error/500')

    }
})


// @desc    Update story
//@route    PUT /stoies/:id
//ensureAuth makes sure that only a user should be able to perform the action
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean();

        if (!story) {
            return res.render('error/404')
        }

        if(story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate(
                { _id: req.params.id},
                //value being replaced 
                req.body, {
                //creates new value if it doesnt exist
                new: true,
                //make sure the mongoose feilds are valid
                runValidators: true,
            })

            res.redirect('/dashboard')
        }

    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


// @desc    Delete story
//@route    DELETE /stoies/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.remove({ _id: req.params.id})
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    User stories
//@route    GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
       const stories = await Story.find({ user: req.params.userId,
        status: 'public'})
        .populate('user')
        .lean()
        res.render('stories/index', {stories});
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


module.exports = router