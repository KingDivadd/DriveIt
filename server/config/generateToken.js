const jwt = require('jsonwebtoken')

const generateToken = (id, name, email, role, plate_no, engine_no) => {
    return jwt.sign({ id, name, email, role, plate_no, engine_no }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
}

module.exports = generateToken