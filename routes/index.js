//This file contains main routes such as /dashboard

const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth')

//bring in the story model
const Story = require('../models/Story')

// @desc    Login/Landing page
//@route    GET /
//ensureGuest makes sure that only a guest should be able to see the login 
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

// @desc    Dashboard
//@route    GET /dashboard
//ensureAuth allows only authorized users to see the dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {

    try {
        const stories = await Story.find({ user: req.user.id }).lean() //lean returns plain javascrip objects (as opposed to mongoose documents) that can be rendered within the handlebars template

        res.render('dashboard', {
            name: req.user.firstName,
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')

    }
    
    
})  

module.exports = router