const mongoose = require('mongoose')

const dailyLog = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: 'Vehicles', required: true },
    startingLocation: { type: String, trim: true, },
    endingLocatin: { type: String, trim: true, },
    startingMillage: { type: String, trim: true, },
    startingMillage: { type: String, trim: true, },
    enteredBy: { type: mongoose.Types.ObjectId, ref: "User", required: true }

}, { timestamps: true })

module.exports = mongoose.model('Daily_Log', dailyLog)