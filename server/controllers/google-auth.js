const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../model/user-model")

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5500/google/callback",
        passReqToCallback: true
    },
    async function(request, accessToken, refreshToken, profile, done) {
        // here we will create a user if not logged in before and if otherwise, we will find that user and fetch his info
        const findUser = await User.findOne({ email: profile.emails[0].value })
        if (!findUser) {
            const createUser = await User.create({ name: profile.displayName, email: profile.emails[0], pic: profile.photos[0].value })
        }
        console.log(`Email ${profile.emails[0].value} already exist`);
        return done(null, profile);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(user, done) {
    done(null, user)
})