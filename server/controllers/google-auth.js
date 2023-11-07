// const passport = require('passport')
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require("../model/user-model")
// const { StatusCodes } = require('http-status-codes')

// passport.use(new GoogleStrategy({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: "http://localhost:5500/google/callback",
//         passReqToCallback: true
//     },
//     async function(request, accessToken, refreshToken, profile, done) {

//         const userExist = await User.findOne({ email: profile.emails[0].value })
//         if (!userExist) {
//             console.log(`${profile.emails[0].value} is not a registered email address`)
//             const newUser = await User.create({ email: email, pic: profile.photos[0].value, name: profile.displayName })
//             if (!newUser) {
//                 res.status(StatusCodes.BAD_REQUEST).json({ err: `User creation failed` })
//             }
//             res.status(StatusCodes.OK).json({ userInfo: newUser })
//         }
//         // console.log(`Name : ${profile.displayName}, email: ${profile.emails[0].value}, Pic: ${profile.photos[0].value}`)
//         return done(null, profile);
//         res.status(200).json({ msg: `${profile.emails[0].value} is a registred email address.`, userInfo: userExist })
//     }
// ));

// passport.serializeUser(function(user, done) {
//     done(null, user)
// })

// passport.deserializeUser(function(user, done) {
//     done(null, user)
// })