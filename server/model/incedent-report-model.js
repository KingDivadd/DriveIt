const mongoose = require('mongoose')

const incedentReportSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Types.ObjectId, ref: 'Vehicles', required: true },
    location: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    image: { type: String, trim: true },
})

module.exports = mongoose.model("IncedentReport", incedentReportSchema)