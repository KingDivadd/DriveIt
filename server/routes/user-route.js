const express = require('express')
const router = express.Router()
const { editName, editPic, editPhone, allUsers, addDriver, transferDriver } = require('../controllers/user-controller')
const tokenDecoder = require('../middleware/auth-middleware')

router.route('/all-users').get(tokenDecoder, allUsers)
router.route('/edit-name').patch(tokenDecoder, editName)
router.route('/edit-pic').patch(tokenDecoder, editPic)
router.route('/edit-phone').patch(tokenDecoder, editPhone)
router.route('/add-driver').patch(tokenDecoder, addDriver)
router.route('/transfer-driver').patch(tokenDecoder, transferDriver)

module.exports = router