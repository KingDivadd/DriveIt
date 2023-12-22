const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true, },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, required: true, },
}, { timestamps: true })

module.exports = mongoose.model("Notification_Log", notificationSchema)