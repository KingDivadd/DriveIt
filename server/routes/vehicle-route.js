const express = require('express')
const router = express.Router()
const tokenDecoder = require("../middleware/auth-middleware")
const { addVehicle, getAllVehicles, adminUpdateVehicleInfo, deleteVehicle, assignVehicle, deassignVehicle, createVehicleMaintLog, editVehicleMaintLog } = require('../controllers/vehicle-controller')


router.route('/admin-update-vehicle-info').put(tokenDecoder, adminUpdateVehicleInfo)
router.route('/create-vehicle-maint-log').patch(tokenDecoder, createVehicleMaintLog)
router.route('/edit-vehicle-maint-log').patch(tokenDecoder, editVehicleMaintLog)
router.route('/delete-vehicle').delete(tokenDecoder, deleteVehicle)
router.route('/assign-vehicle').patch(tokenDecoder, deleteVehicle)
router.route('/deassign-vehicle').patch(tokenDecoder, deleteVehicle)
router.route('/all-vehicles').get(tokenDecoder, getAllVehicles)
router.route('/add-vehicle').post(tokenDecoder, addVehicle)

module.exports = router