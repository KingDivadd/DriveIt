const express = require('express')
const router = express.Router()
const { signUp, login, recoverPassword } = require('../controllers/auth-controller')
const tokenDecoder = require('../middleware/auth-middleware')

router.route("/").post(login)
router.route("/signup").post(signUp)
router.route("/recover-password").post(recoverPassword)


module.exports = router