const mongoose = require('mongoose')

const planMaintSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: "Vehicle", required: true },
    services: [{ type: String, required: true, trim: true }],
    concerns: [{ type: String, required: true, trim: true }],
    plannedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    proposedTime: { type: Date, default: new Date() }
}, { timestamps: true })

module.exports = mongoose.model("plannedMaint", planMaintSchema)