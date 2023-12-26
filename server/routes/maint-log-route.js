const express = require('express')
const router = express.Router()
const { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog, planMaint, editPlannedMaint, allPlannedMaint } = require('../controllers/maint-log-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route("/all-maint-log").get(allVehicleMaintLog)
router.route("/create-vehicle-maint-log").patch(tokenDecoder, createVehicleMaintLog)
router.route('/edit-vehicle-maint-log').patch(tokenDecoder, editVehicleMaintLog)
router.route('/plan-maint').post(tokenDecoder, planMaint)
router.route('/edit-planned-maint').patch(tokenDecoder, editPlannedMaint)
router.route('/all-planned-maint').get(tokenDecoder, allPlannedMaint)



module.exports = router