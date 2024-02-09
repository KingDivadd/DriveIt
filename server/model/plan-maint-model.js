const mongoose = require('mongoose');

const planMaintSchema = new mongoose.Schema({
    personnelFeedback: {
        issues: { type: String, trim: true },
        repair_done: [{ type: String, trim: true }],
        completion_date: { type: String, trim: true },
        images: [{ type: String, trim: true }],
    },
    plannersFeedback: {
        rating: { type: String, trim: true },
        feedback: { type: String, trim: true },
    },
    maint_id: { type: String, required: true, trim: true, unique: true },
    vehicle: { type: mongoose.Types.ObjectId, ref: "Vehicle", required: true },
    services: [{ type: String, required: true, trim: true }],
    concerns: { type: String, required: true, trim: true },
    plannedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    proposedDate: { type: Date, required: true, trim: true },
    maint_personnel: { type: mongoose.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'in-shop', 'in-progress', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model("plannedMaint", planMaintSchema);