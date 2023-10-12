const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: "Vehicles", required: true },
    maint_type: { type: String, enum: ["Scheduled", "Preventive", "Breakdown"], required: true },
    maint_sub: [{ type: String, enum: ["Vehicle servicing", "Suspension system", "Braking system", "Fuel and Engine system", "Steering system", "Vehicle body"], required: true }],
    cost: { type: Number, trim: true },
    maint_personnel: { type: mongoose.Types.ObjectId, ref: "Users", required: true, },
    add_desc: [{ type: String, trim: true, required: true }],
}, { timestamps: true })

module.exports = mongoose.model("Maintenance_Record", maintenanceSchema)