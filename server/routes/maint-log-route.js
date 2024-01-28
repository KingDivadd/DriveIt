const express = require('express')
const router = express.Router()
const { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog, planMaint, editPlannedMaint, allPlannedMaint } = require('../controllers/maint-log-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route("/all-maint-log").post(tokenDecoder, allVehicleMaintLog)
router.route("/create-maint-log").post(tokenDecoder, createVehicleMaintLog)
router.route('/edit-maint-log').patch(tokenDecoder, editVehicleMaintLog)
router.route('/plan-maint').post(tokenDecoder, planMaint)
router.route('/edit-planned-maint').patch(tokenDecoder, editPlannedMaint)
router.route('/all-planned-maint').post(tokenDecoder, allPlannedMaint)



module.exports = router