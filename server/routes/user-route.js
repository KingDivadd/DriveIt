const express = require('express')
const router = express.Router()
const { editPic, updateUserInfo, getUsers, allUsers, assignDriver, oneUser, filterUsers, assignVehicleToDriver, removeDriver } = require('../controllers/user-controller')
const tokenDecoder = require('../middleware/auth-middleware')

router.route('/all-users').get(tokenDecoder, allUsers)
router.route('/filter-users').post(tokenDecoder, filterUsers)
router.route('/users').get(getUsers)
router.route('/update-user-info/:id').patch(tokenDecoder, updateUserInfo)
router.route('/assign-vehicle/:id').patch(tokenDecoder, assignVehicleToDriver)
router.route('/find-user').post(oneUser)
router.route('/edit-pic').patch(tokenDecoder, editPic)
router.route('/assign-driver').patch(tokenDecoder, assignDriver)
router.route('/remove-driver').patch(tokenDecoder, removeDriver)

module.exports = router