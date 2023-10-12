const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../model/user-model")

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5500/google/callback",
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
        // here we will create a user if not logged in before and if otherwise, we will find that user and fetch his info
        // User.findOrCreate({ _id: profile.id }, function(err, user) {
        //     console.log("user profile => ", profile)
        //     return done(err, user);
        // });
        // console.log("user profile => ", profile)
        return done(null, profile);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(user, done) {
    done(null, user)
})