const express = require('express')
const router = express.Router()
const { newMaintLog, editMaintLog, allMaintLog, vehicleMaintLog } = require('../controllers/maint-log-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route("/all-maint-log").get(allMaintLog)
router.route("/vehicle-maint-log").get(vehicleMaintLog)
router.route("/new-maint-log/:id").post(tokenDecoder, newMaintLog)
router.route("/update-maint-log/:id").put(editMaintLog)


module.exports = router