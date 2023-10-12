const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    vehicle_id: { type: mongoose.Types.ObjectId, ref: "Vehicles", required: true, unique: true },


})

module.exports = mongoose.model("Loaction", locationSchema)