const express = require('express')
const router = express.Router()
const { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog, planMaint, editPlannedMaint, allPlannedMaint, onePlannedMaint, addMaintPersonnelFeedback, editMaintPersonnelFeedback, addVehicleOwnersFeedback, updatePlannedMaintStatus, allMaintLog } = require('../controllers/maint-log-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route("/all-maint-log").post(tokenDecoder, allVehicleMaintLog) // for registered user
router.route("/all-vehicle-maint-log").post(allMaintLog) // for anyone, as long as you provide the vehice id
router.route("/create-maint-log").post(tokenDecoder, createVehicleMaintLog)
router.route('/edit-maint-log').patch(tokenDecoder, editVehicleMaintLog)
    // Planneed mainteance
router.route('/plan-maint').post(tokenDecoder, planMaint)
router.route('/edit-planned-maint').patch(tokenDecoder, editPlannedMaint)
router.route('/update-maint-status').patch(tokenDecoder, updatePlannedMaintStatus)
router.route('/all-planned-maint').post(tokenDecoder, allPlannedMaint)
router.route('/all-planned-maint/:id').post(tokenDecoder, onePlannedMaint)
router.route('/maintenance-feedback').patch(tokenDecoder, addMaintPersonnelFeedback)
router.route('/edit-maintenance-feedback').patch(tokenDecoder, editMaintPersonnelFeedback)
router.route('/owners-feedback').patch(tokenDecoder, addVehicleOwnersFeedback)



module.exports = router