const express = require('express')
const router = express.Router()
const { uploadImage, deleteImage } = require('../controllers/image-upload')
const tokenDecoder = require('../middleware/auth-middleware')

router.route("/").post(tokenDecoder, uploadImage)
router.route("/deleteimage").delete(tokenDecoder, deleteImage)
module.exports = router