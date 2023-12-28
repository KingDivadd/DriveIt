const mongoose = require('mongoose')

const planMaintSchema = new mongoose.Schema({
    services: [{ type: String, required: true }],
    concerns: { type: String, required: true },
    plannedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true })

module.exports = mongoose.model("plannedMaint", planMaintSchema)