const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const bodyParser = require('body-parser')
const connectDB = require('./config/db')
const cors = require('cors')
require('dotenv').config()
require('colors')
const session = require('express-session')
const authRoute = require('./routes/auth-route')
const userRoute = require("./routes/user-route")
const vehicleRoute = require("./routes/vehicle-route")
const maintLogRoute = require("./routes/maint-log-route")
const { beginTracking } = require("./controllers/location-controller")
const imageRoute = require("./routes/image-route")
const dailyLogRoute = require("./routes/daily-log-route")
const notificationRoute = require("./routes/notification-route")
const notFoundMiddleWare = require("./middleware/not-found-middleware")
const errorHandlerMiddleWare = require("./middleware/error-handler-middleware")

// const passport = require('passport')

const app = express()
const server = http.createServer(app)


// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     cookie: {
//         maxAge: 60000 * 1,
//         secure: false
//     }
// }))
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// socket
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"]
    }
})

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`.yellow.bold)

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data)
    })
})


// Routes
app.use("/api/auth", authRoute)
app.use("/api/user", userRoute)
app.use("/api/vehicle", vehicleRoute)
app.use("/api/maint-log", maintLogRoute)
    // app.use("/api/location", locationRoute)
app.use("/api/drivers-log", dailyLogRoute)
app.use("/api/notification", notificationRoute)

beginTracking()

// Errors
app.use(notFoundMiddleWare)
    // app.use(errorHandlerMiddleWare)


// running the app
const start = async() => {
    const PORT = process.env.PORT || 5500
    try {
        await connectDB()
        server.listen(PORT, console.log(`DriveIt SERVER started andd running on PORT ${PORT}`.cyan.bold))
    } catch (err) {
        console.log('something went wrong'.red.bold, err)
    }
}
start()