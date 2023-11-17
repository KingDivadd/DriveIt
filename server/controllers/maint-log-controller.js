const asyncHandler = require('express-async-handler')
const Maintenance_Log = require('../model/maint-log-model')
const Vehicle = require("../model/vehicle-model")
const { StatusCodes } = require('http-status-codes')

const allVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id } = req.body
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const maint_info = vehicleExist.maint_info
    if (!maint_info.length) {
        return res.status(StatusCodes.OK).json({ msg: `There are no maintenance logs writted yet...` })
    }
    const maint_logs = await Vehicle.findOne({ _id: vehicle_id }).populate("assigned_to", "firstName lastName role staffId phone pic").populate("maint_info")

    return res.status(StatusCodes.OK).json({ nbMaintLogs: maint_info.length, vehicleMaintenanceLogs: maint_logs })

})


module.exports = { allVehicleMaintLog }