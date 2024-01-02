const express = require('express')
const router = express.Router()
const { editPic, updateUserInfo, getUsers, allUsers, assignDriver, oneUser, filterUsers, removeDriver, deleteUser } = require('../controllers/user-controller')
const tokenDecoder = require('../middleware/auth-middleware')

router.route('/all-users').get(tokenDecoder, allUsers)
router.route('/filter-users').post(filterUsers)
router.route('/users').get(getUsers)
router.route('/update-user-info').patch(tokenDecoder, updateUserInfo)
router.route('/find-user').post(tokenDecoder, oneUser)
router.route('/edit-pic').patch(tokenDecoder, editPic)
router.route('/assign-driver').patch(tokenDecoder, assignDriver)
router.route('/remove-driver').patch(tokenDecoder, removeDriver)
router.route('/delete-user').delete(tokenDecoder, deleteUser)

module.exports = router