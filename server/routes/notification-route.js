const express = require('express')
const router = express.Router()
const { allNotifications, filterNotifications } = require("../controllers/notification-controller")
const tokenDecoder = require('../middleware/auth-middleware')


router.route('/all-notifications').get(tokenDecoder, allNotifications)
router.route('/filter-notifications').post(tokenDecoder, filterNotifications)
module.exports = router