const mongoose = require('mongoose')

const dailyLog = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: 'Vehicles', required: true },
    startingLocation: { type: String, trim: true, },
    endingLocation: { type: String, trim: true, },
    route: { type: String, trim: true, },
    startingMileage: { type: String, trim: true, },
    endingMileage: { type: String, trim: true, },
    dailyMileage: { type: String, trim: true },
    fuelLevel: { type: String, enum: ["low", "mid", "full"] },
    addedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }

}, { timestamps: true })

module.exports = mongoose.model('Daily_Log', dailyLog)