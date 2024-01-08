const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    staffId: { type: String, required: true, trim: true, unique: true },
    phone: { type: Number, trim: true },
    role: { type: String, enum: ['driver', 'vehicle_assignee', 'vehicle_coordinator', 'maintenance_personnel'] },
    driver: { type: mongoose.Types.ObjectId, ref: "User" },
    dept: { type: String, enum: ['SEET', 'SAAT', 'SOS', 'SEMS', 'SHIT', 'SO'] },
    pic: { type: String, trim: true, default: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.everypixel.com%2Fimage-4793490485129704755&psig=AOvVaw1uAYYLymIui8tJqyoSNjM8&ust=1704784898193000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJjTie6gzYMDFQAAAAAdAAAAABAD' },
    vehicle: { type: mongoose.Types.ObjectId, ref: "Vehicle" },
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)