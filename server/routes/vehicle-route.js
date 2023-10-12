const express = require('express')
const router = express.Router()
const { addVehicle, getAllVehicles, updateVehicleInfo } = require('../controllers/vehicle-controller')
const tokenDecoder = require("../middleware/auth-middleware")

router.route('/update-vehicle-info/:id').put(tokenDecoder, updateVehicleInfo)
router.route('/all-vehicles').get(tokenDecoder, getAllVehicles)
router.route('/add-vehicle').post(tokenDecoder, addVehicle)

module.exports = router