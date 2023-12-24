const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    vehicle_id: { type: mongoose.Types.ObjectId, ref: "Vehicles", required: true, unique: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
}, { timestamps: true })

module.exports = mongoose.model("Loaction", locationSchema)