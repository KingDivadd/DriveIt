const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    brand: { type: String, required: true, trim: true },
    plate_no: { type: String, required: true, unique: true, trim: true }, // this is unique
    current_millage: { type: Number, required: true, trim: true }, // in the future this is to be added autom...
    engine_no: { type: String, required: true, trim: true },
    assigned_to: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    added_by: { type: mongoose.Types.ObjectId, ref: "User" },
    current_state: [{ type: String, trim: true }],
    vehicle_type: { type: String, enum: ['bus', 'car'], required: true },
    department: [{ type: String, enum: ['SEET', 'SAAT', 'SEMS', 'SOS', 'SHIT'] }],
    maint_info: [{ type: mongoose.Types.ObjectId, ref: "Maintenance_Record" }],
    daily_log: [{ type: mongoose.Types.ObjectId, ref: "Daily_Log" }],
    location: { type: mongoose.Types.ObjectId, ref: "Location" }
}, { timestamps: true })


module.exports = mongoose.model("Vehicles", vehicleSchema)