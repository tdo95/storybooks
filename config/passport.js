const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function(passport) {
    //create google strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
,
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
        //eventually well want to save user in the database
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
        try {
            //look for user
            let user = await User.findOne( {googleId: profile.id})

            if (user) {
                console.log('User Found', user)
                done(null, user)
                
            } else {
                //create user
                user = await User.create(newUser)
                console.log('created user', user)
                done(null, user)
                
            }
        } catch (err) {
            console.error(err)

        }
    }))

    //serialize user, uses cookies instead of user credentials ? idk kinda confused on what this is doing
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    }) 
}