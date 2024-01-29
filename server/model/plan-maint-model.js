const mongoose = require('mongoose')

const planMaintSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: "Vehicle", required: true },
    services: [{ type: String, required: true, trim: true }],
    concerns: [{ type: String, required: true, trim: true }],
    plannedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    proposedDate: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'in-shop', 'in-progress', 'completed'], default: 'pending' }
}, { timestamps: true })

module.exports = mongoose.model("plannedMaint", planMaintSchema)