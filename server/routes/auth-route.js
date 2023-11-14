const express = require('express')
const router = express.Router()
const { signUp, signIn, recoverPassword, recoveryCode, recoveryCodeVerify } = require('../controllers/auth-controller')
    // const tokenDecoder = require('../middleware/auth-middleware')

router.route("/signup").post(signUp)
router.route("/login").post(signIn)
router.route("/recover-password").post(recoverPassword)
router.route("/password-recovery-code").post(recoveryCode)
router.route("/recovery-code-verify").post(recoveryCodeVerify)


module.exports = router