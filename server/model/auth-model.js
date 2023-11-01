const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const authSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    password: { type: String, trim: true, required: true },
    uniqueCode: { type: String, trim: true, required: true },
    googleAuth: { type: Boolean }
}, { timestamps: true })

// Hash password
authSchema.pre("save", async function(next) {
    if (!this.isModified) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Compare password
authSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("Auth", authSchema)