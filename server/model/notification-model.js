const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true, },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    vehicleInfo: { type: mongoose.Types.ObjectId, ref: "Vehicle", },
    maintLogInfo: { type: mongoose.Types.ObjectId, ref: "Maintenance_Log", },
    planMaintInfo: { type: mongoose.Types.ObjectId, ref: "plannedMaint", },
    staffInfo: { type: mongoose.Types.ObjectId, ref: "User", },
    message: { type: String, trim: true, required: true, },
    access: { type: String, enum: ['vehicle_asignee', 'admin', 'maintenance_personnel'], required: true },
}, { timestamps: true })

module.exports = mongoose.model("Notification_Log", notificationSchema)