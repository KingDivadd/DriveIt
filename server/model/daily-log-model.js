const mongoose = require('mongoose')

const dailyLog = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: 'Vehicles', required: true },


}, { timestamps: true })

module.exports = mongoose.model('Daily_Log', dailyLog)