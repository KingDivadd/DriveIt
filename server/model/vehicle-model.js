const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    brand: { type: String, required: true, trim: true },
    vehicle_name: { type: String, required: true, trim: true },
    fuel_type: { type: String, trim: true, default: "pms" },
    vehicle_color: { type: String, required: true, trim: true },
    chasis_no: { type: String, required: true, trim: true },
    manufacture_year: { type: String, trim: true },
    current_location: { type: String, trim: true, default: "Akure,Ondo state" },
    vehicle_image: { type: String, trim: true, default: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600" },
    plate_no: { type: String, required: true, trim: true }, // this is unique
    service_mileage: { type: String, trim: true, default: '00000' }, // this should only be entered manually once
    current_mileage: { type: String, required: true, trim: true }, // in the future this is to be added autom...
    daily_mileage: { type: String, trim: true, default: '00000' },
    engine_no: { type: String, required: true, trim: true },
    assigned_to: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    added_by: { type: mongoose.Types.ObjectId, ref: "User" },
    current_state: [{ type: String, trim: true }],
    vehicle_type: { type: String, enum: ['bus', 'car'], default: "car" },
    department: [{ type: String, enum: ['SEET', 'SAAT', 'SEMS', 'SOS', 'SHIT'] }],
    maint_logs: [{ type: mongoose.Types.ObjectId, ref: "Maintenance_Log" }],
    planned_maint: [{ type: mongoose.Types.ObjectId, ref: "plannedMaint" }],
    daily_log: [{ type: mongoose.Types.ObjectId, ref: "Daily_Log" }],
    location: { type: mongoose.Types.ObjectId, ref: "Location" }
}, { timestamps: true })


module.exports = mongoose.model("Vehicles", vehicleSchema)