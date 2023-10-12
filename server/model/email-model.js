const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema({
    // email_source: { type: String, trim: true, required: true, unique: true },
    email_receiver: [{ type: String, trim: true, required: true }],
    email_subject: { type: String, trim: true },
    email_body: { type: String, trim: true }
}, { timestamps: true })

module.exports = mongoose.model("Emails", emailSchema)