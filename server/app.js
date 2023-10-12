const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
require('dotenv').config()
require('colors')
require('./controllers/google-auth')
const session = require('express-session')
const authRoute = require('./routes/auth-route')
const userRoute = require("./routes/user-route")
const vehicleRoute = require("./routes/vehicle-route")
const maintRoute = require("./routes/maint-route")
const locationRoute = require("./routes/location-route")
const notFoundMiddleWare = require("./middleware/not-found-middleware")
const passport = require('passport')

const app = express()

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 60000 * 1,
        secure: false
    }
}))
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json())
app.use(cors())

// Routes
app.use("/api/auth", authRoute)
app.use("/api/user", userRoute)
app.use("/api/vehicle", vehicleRoute)
app.use("/api/maint", maintRoute)
app.use("/api/location", locationRoute)

//----- practicing google auth

const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401)
}

app.get("/", (req, res) => {
    res.send(`<a href="/auth/google"> Authenticate with Google </a>`) // this will be a button in the front.
})
app.get("/protected", isLoggedIn, (req, res) => {
    console.log(req.user)
    res.send(`Hello ${req.user.displayName}`)
})
app.get('/auth/google', passport.authenticate('google', { scope: ["email", "profile"] }));
app.get(`/google/callback`, passport.authenticate('google', { successRedirect: '/protected', failureRedirect: '/auth/failure' }))

app.get(`/auth/failure`, (req, res) => {
    res.send("Something went wrong") // should be  a designed page on the frontend.
})

app.get('/logout', (req, res) => {
    // req.logout();
    req.session.destroy()
    res.send('Goodbye')
})

// Errors
app.use(notFoundMiddleWare)

const start = async() => {
    const PORT = process.env.PORT
    try {
        // await connectDB()
        app.listen(PORT, console.log(`SERVER started and running on PORT ${PORT}`.cyan.bold))
    } catch (err) {
        console.log('something went wrong'.red.bold, err)
    }
}
start()