const jwt = require('jsonwebtoken')

const generateToken = (id, firstName, lastName, pic, email, role, plate_no, engine_no) => {
    return jwt.sign({ id, firstName, lastName, pic, email, role, plate_no, engine_no }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
}

module.exports = generateToken