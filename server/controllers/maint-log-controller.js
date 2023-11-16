const asyncHandler = require('express-async-handler')
const Maint = require('../model/maint-log-model')
const Vehicle = require("../model/vehicle-model")

// create a new maintenance log
const newMaintLog = asyncHandler(async(req, res) => {
    const { id: vehicle_id } = req.params
    const { maint_type, cost, add_desc, maint_sub, current_state } = req.body
    if (req.info.role !== "maintenance personnel") {
        res.status(500).json({ msg: "Maintenance record restricted only to maintenance personnel" })
    } else {
        if (!maint_type || maint_sub.length === 0 || add_desc.length === 0 || !vehicle_id) {
            res.status(500).json({ msg: "Field cannot be empty" })
        }
        const maint_personnel = req.info.id

        const maintLog = await Maint.create({ vehicle: vehicle_id, maint_type, cost, maint_personnel, add_desc, maint_sub, current_state })
        if (!maintLog) {
            res.status(500).json({ msg: "Error. Maintenance logging failed" })
        }
        const vehicleBranch = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { $push: { maint_info: maintLog._id } }, { new: true, runValidators: true })
        if (!vehicleBranch) {
            res.status(500).json({ msg: "Error. Attaching maintenance log to vehicle failed" })
        }
        res.status(200).json({ msg: "Maintenance log added to vehicle successfully", maintLog: vehicleBranch })
    }
})

// Edit maint log
const editMaintLog = asyncHandler(async(req, res) => {
    const { id: vehicle_id } = req.params
    const { maint_id, maint_type, maint_sub, cost, add_desc } = req.body
    if (!vehicle_id) {
        res.status(500).json({ msg: "No vehicle provided" })
    }
    if (!maint_id) {
        res.status(500).json({ msg: "Maintenance log's ID to be updated not provided " })
    }
    // in the future make sure the maint_id entered is for the car whose id is above.
    const update = {};
    if (cost.trim() !== '') {
        update.cost = cost.trim();
    }
    if (maint_type.trim() !== '') {
        update.maint_type = maint_type.trim();
    }
    if (maint_sub && maint_sub.length > 0) {
        update.maint_sub = maint_sub.map(data => data.trim()).filter(data => data !== '');
    }
    if (add_desc && add_desc.length > 0) {
        update.add_desc = add_desc.map(data => data.trim()).filter(data => data !== '');
    }
    const updatedMaintLog = await Maint.findOneAndUpdate({ _id: maint_id }, update, { new: true, runValidators: true })
    if (!updatedMaintLog) {
        res.status(500).json({ msg: "Error. updateMaintLog failed" })
    }
    res.status(200).json({ msg: `maint log with id ${maint_id} successful`, newManitLog: updatedMaintLog })
})

// Fetch all maint log
const allMaintLog = asyncHandler(async(req, res) => {
    const allMaintLog = await Maint.find({})
    if (!allMaintLog) {
        res.status(500).json({ msg: "Error fetching all maintenance log" })
    }
    res.status(200).json({ nbHits: allMaintLog.length, maint_logs: allMaintLog })
})

// Fetch maint log based on vehicles

const vehicleMaintLog = asyncHandler(async(req, res) => {
    const vehicleMaintLog = await Vehicle.find({}).select("_id plate_no vehicle_type location maint_info")
    if (!vehicleMaintLog) {
        res.status(500).json({ msg: "Error. Could not fetch all vehicles" })
    }
    res.status(200).json({ nbHits: vehicleMaintLog.length, maint_logs: vehicleMaintLog })
})


module.exports = { newMaintLog, editMaintLog, allMaintLog, vehicleMaintLog }