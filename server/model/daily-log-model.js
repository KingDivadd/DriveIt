const mongoose = require('mongoose')

const dailyLog = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: 'Vehicles', required: true },
    currentLocation: { type: String, trim: true, },
    startingMileage: { type: String, trim: true, },
    endingMileage: { type: String, trim: true, },
    startingFuelLevel: { type: String, trim: true, },
    endingFuelLevel: { type: String, trim: true },
    addedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    logTime: { type: String, enum: ['morning', 'evening'], required: true, trim: true }

}, { timestamps: true })

module.exports = mongoose.model('Daily_Log', dailyLog)