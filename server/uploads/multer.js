const multer = require('multer')
const path = require('path')

// specify the storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) { // cb => callback
        cb(null, __dirname)
            // cb(null, path.join(__dirname, './uploads/'))
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// file validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb({ msg: `Unsupported file format` }, false)
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 },
    fileFilter: fileFilter,
})

module.exports = upload