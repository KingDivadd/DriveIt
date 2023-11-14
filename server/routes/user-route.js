const express = require('express')
const router = express.Router()
const { editPic, updateUserInfo, allUsers, addDriver, transferDriver, oneUser, filterUsers, assignVehicleToDriver } = require('../controllers/user-controller')
const tokenDecoder = require('../middleware/auth-middleware')

router.route('/all-users').get(tokenDecoder, allUsers)
router.route('/filter-users').post(tokenDecoder, filterUsers)
    // router.route('/users').get(getUsers)
router.route('/update-user-info/:id').patch(tokenDecoder, updateUserInfo)
router.route('/assign-vehicle/:id').patch(tokenDecoder, assignVehicleToDriver)
router.route('/find-user').post(oneUser)
router.route('/edit-pic').patch(tokenDecoder, editPic)
router.route('/add-driver').patch(tokenDecoder, addDriver)
router.route('/transfer-driver').patch(tokenDecoder, transferDriver)

module.exports = router