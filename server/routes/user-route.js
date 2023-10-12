const express = require('express')
const router = express.Router()
const { editName, editPic, editPhone, allUsers } = require('../controllers/user-controller')
const tokenDecoder = require('../middleware/auth-middleware')

router.route('/all-users').get(tokenDecoder, allUsers)
router.route('/edit-name').patch(tokenDecoder, editName)
router.route('/edit-pic').patch(tokenDecoder, editPic)
router.route('/edit-phone').patch(tokenDecoder, editPhone)

module.exports = router