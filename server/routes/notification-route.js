const express = require('express')
const router = express.Router()
const { allNotifications } = require("../controllers/notification-controller")


router.route('/all-notifications').get(allNotifications)
module.exports = router