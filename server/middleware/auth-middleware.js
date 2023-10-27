const jwt = require('jsonwebtoken')


const tokenDecoder = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer")) {
        const token = authHeader.split(' ')[1]
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            const { id, name, pic, email, role, plate_no, engine_no } = decode
            req.info = { id, name, pic, email, role, plate_no, engine_no }
            next()
        } catch (err) {
            res.status(500).json({ msg: "Not authorized to access this route" })
        }
    } else {
        res.status(500).json({ msg: "No token provided" })
    }
}

module.exports = tokenDecoder