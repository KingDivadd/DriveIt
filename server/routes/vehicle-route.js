const express = require('express')
const router = express.Router()
const tokenDecoder = require("../middleware/auth-middleware")
const { addVehicle, getAllVehicles, adminUpdateVehicleInfo, deleteVehicle, userVehicle, assignVehicle, deassignVehicle } = require('../controllers/vehicle-controller')

router.route('/admin-update-vehicle-info').put(tokenDecoder, adminUpdateVehicleInfo)
router.route('/user-vehicle').post(tokenDecoder, userVehicle)
router.route('/delete-vehicle').delete(tokenDecoder, deleteVehicle)
router.route('/assign-vehicle').patch(tokenDecoder, assignVehicle)
router.route('/deassign-vehicle').patch(tokenDecoder, deassignVehicle)
router.route('/all-vehicles').post(tokenDecoder, getAllVehicles)
router.route('/add-vehicle').post(tokenDecoder, addVehicle)

module.exports = router