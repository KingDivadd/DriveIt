const express = require('express')
const router = express.Router()
const { allNotifications } = require("../controllers/notification-controller")
const tokenDecoder = require('../middleware/auth-middleware')


router.route('/all-notifications').get(tokenDecoder, allNotifications)
module.exports = router