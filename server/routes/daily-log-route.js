const express = require('express')
const router = express.Router()
const { deleteLog, editLog, newLog, allLog } = require('../controllers/daily-log-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route('/all-logs').post(tokenDecoder, allLog)
router.route('/new-log').post(tokenDecoder, newLog)
router.route('/edit-log/').patch(tokenDecoder, editLog)
router.route('/delete-log').delete(tokenDecoder, deleteLog)

module.exports = router