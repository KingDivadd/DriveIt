const express = require('express')
const router = express.Router()
const { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog, } = require('../controllers/maint-log-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route("/all-maint-log").get(allVehicleMaintLog)
router.route("/create-vehicle-maint-log").patch(tokenDecoder, createVehicleMaintLog)
router.route('/edit-vehicle-maint-log').patch(tokenDecoder, editVehicleMaintLog)



module.exports = router