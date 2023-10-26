const express = require('express')
const router = express.Router()
const { uploadImage } = require('../controllers/image-upload')

router.route("/").post(uploadImage)

module.exports = router