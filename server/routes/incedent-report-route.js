const express = require('express')
const router = express.Router()
const { newIncedent, allIncedentReport } = require('../controllers/incedent-report-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route('/new-incedent').post(tokenDecoder, newIncedent)
router.route('/all-incedent').post(tokenDecoder, allIncedentReport)


module.exports = router