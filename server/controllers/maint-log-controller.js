const asyncHandler = require('express-async-handler')
const Maintenance_Log = require('../model/maint-log-model')
const Vehicle = require("../model/vehicle-model")
const { StatusCodes } = require('http-status-codes')
const Notification = require("../model/notification-model")

const allVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, maint_type, } = req.body
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const query = {}
    query.vehicle = vehicle_id
    if (maint_type) {
        query.maint_type = maint_type
    }
    const maint_log = await Maintenance_Log.find(query)
    return res.status(200).json({ nbHit: maint_log.length, Maintenance_log: maint_log })

})

// Vehicle maintenance log to be access only by the maintenance personnel
const createVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, maint_type, cost, add_desc, maint_sub, } = req.body
    if (req.info.id.role !== 'maintenance_personnel') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... only a maintenance personnel is authorized to perfom this operation!!!` })
    }
    if (!vehicle_id) {
        return res.status(500).json({ err: `Error... Please select a vehicle by providing it's ID!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    if (!maint_type || !maint_sub || !add_desc) {
        return res.status(500).json({ err: `Error... Please fill all fields!!!` })
    }
    const maintLog = {}
    if (cost.trim() !== '') {
        maintLog.cost = Number(cost.trim()).toLocaleString()
    }
    // maintLog.current_state = current_state

    maintLog.vehicle = vehicle_id
    maintLog.maint_type = maint_type
    maintLog.maint_sub = maint_sub
    maintLog.maint_personnel = req.info.id.id
    maintLog.add_desc = add_desc

    // now create the maintenance log first
    const newMaintLog = await Maintenance_Log.create(maintLog)
    if (!newMaintLog) {
        return res.status(500).json({ err: `Error... Unable to create maint log for vehicle with ID of ${vehicle_id}` })
    }
    // now add the log to the vehicle model
    const maint_info = vehicleExist.maint_info
    maint_info.push(newMaintLog)

    await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { maint_info }, { new: true, runValidators: true }).populate("maint_info")

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, maintLogInfo: newMaintLog.id, title: "Vehicle Maintenance log.", message: `A new maintenance log has been added to the vehicle vehicle. Click here to view full information.`, access: 'maintenance_personnel' })

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, maintLogInfo: newMaintLog.id, title: "Vehicle Maintenance log.", message: `A new maintenance log has been added to your vehicle vehicle. Click here to view full information.`, access: 'vehicle_asignee' })
    res.status(StatusCodes.OK).json({ msg: `Maintenance log created and added to vehicle successfully...`, newVehicleInfo: newMaintLog })

})

const editVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, maint_log_id, maint_type, maint_sub, cost, add_desc } = req.body
    if (!vehicle_id) {
        return res.status(500).json({ err: `Error... Please provide the vehicle's ID!!!` })
    }
    if (req.info.id.role !== 'maintenance_personnel') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Only Maintenance Personnel can make changes to maintenance logs!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const maint_logExist = await Maintenance_Log.findOne({ _id: maint_log_id, vehicle: vehicle_id })
    if (!maint_logExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Maintenence log with ID ${maint_log_id} not found!!!` })
    }
    // now we've established that vehicle and maint_log exist and the vehicle contains the maint_log
    // let us now update the log
    const update = {}
    if (maint_type) {
        update.maint_type = maint_type
    }
    update.maint_sub = maint_sub
    update.add_desc = add_desc
    if (cost.trim() !== '') {
        update.cost = Number(cost.trim()).toLocaleString()
    }

    const updateLog = await Maintenance_Log.findOneAndUpdate({ _id: maint_log_id }, { $set: update }, { new: true, runValidators: true })

    await Vehicle.findOne({ _id: vehicle_id }).populate("maint_info")

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, maintLogInfo: maint_log_id, title: "Vehicle Maintenance log.", message: `A maintenance log for a vehicle has been updated successfully. Click here to view full information.`, access: 'maintenance_personnel' })

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, maintLogInfo: maint_log_id, title: "Vehicle Maintenance log.", message: `A maintenance log for your vehicle has been updated successfully. Click here to view full information.`, access: 'vehicle_asignee' })


    res.status(StatusCodes.OK).json({ msg: `Vehicle with ID ${vehicle_id} maintenance log updated successfully`, updatedVehicleMaintLog: updateLog })
})

module.exports = { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog }