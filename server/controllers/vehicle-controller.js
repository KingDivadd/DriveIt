const asyncHandler = require('express-async-handler')
const Vehicle = require('../model/vehicle-model')
const User = require('../model/user-model')
const Maintenance_Log = require('../model/maint-log-model')
const generateToken = require("../config/generateToken")
const { StatusCodes } = require("http-status-codes")
const sendEmail = require("./email-controller")

// createing a vehicle instance
const addVehicle = asyncHandler(async(req, res) => {
    const { plate_no, engine_no, current_millage, department, vehicle_type, brand } = req.body

    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: "Error. You're not authorized to perform this operation!!!" })
    }
    if (!plate_no || !engine_no || !vehicle_type || !brand || !current_millage) {
        res.status(500).json({ err: "Please enter provide all vehicle information!!!" })
    }
    // check if a vehicle with the entered plate number exist
    const query = {
        $or: [
            { plate_no: { $regex: new RegExp(plate_no, 'i') } },
            { engine_no: { $regex: new RegExp(engine_no, 'i') } }
        ]
    };

    const vehicleExist = await Vehicle.find(query)
    if (vehicleExist.length) {
        return res.status(500).json({ err: `Vehicle with Plate NO. ${plate_no} or/and ENGINE NO ${engine_no} already exist!!!` })
    }
    req.body.added_by = req.info.id.id
    const newVehicle = await Vehicle.create(req.body)
    res.status(StatusCodes.CREATED).json({ msg: `A new vehicle with plate number ${plate_no} has been added to the system`, new_Vehicle: newVehicle })

})

//List all vehicles
const getAllVehicles = asyncHandler(async(req, res) => {
    const allVehicles = await Vehicle.find({})
    if (!allVehicles) {
        res.status(500).json({ msg: "Error Fetching all vehicles" })
    }
    res.status(StatusCodes.OK).json({ nbHits: allVehicles.length, availVehicles: allVehicles })
})

// Update vehicle infomation
const adminUpdateVehicleInfo = asyncHandler(async(req, res) => {
    const { vehicle_id, brand, plate_no, vehicle_type, current_millage, engine_no, current_state, department } = req.body
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... You are unauthorized to perform this operation!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }

    const update = {}
    if (current_millage.trim() !== '') {
        update.current_millage = current_millage.trim()
    }
    // engine no => can only be edited by maint personnel
    if (engine_no.trim() !== '') {
        update.engine_no = engine_no.trim()
    }
    if (department.trim() !== '') {
        // first we will have to check if the selected department dont already exist
        const dept = department.trim()
        const deptExist = await Vehicle.findOne({ _id: vehicle_id })
        if (dept in deptExist.department === false) {
            update.department = dept
        }
    }
    if (vehicle_type.trim() !== '') {
        update.vehicle_type = vehicle_type.trim()
    }
    if (brand.trim() !== '') {
        update.brand = brand.trim()
    }
    if (plate_no.trim() !== '') {
        update.plate_no = plate_no.trim()
    }
    // The above will be done in the maintenance controller and will be linked to the vehicle

    const newVehicleInfo = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { $set: update }, { new: true, runValidators: true })

    res.status(StatusCodes.OK).json({ msg: "Vehicle Info updated successfully", newVehicleInfo: newVehicleInfo })
})

// Vehicle maintenance log to be access only by the maintenance personnel
const createVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, maint_type, cost, add_desc, maint_sub, current_state } = req.body
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
    if (cost.trim !== '') {
        maintLog.cost = cost.trim()
    }
    if (current_state.trim !== '') {
        maintLog.current_state = current_state.trim()
    }

    maintLog.vehicle = vehicle_id
    maintLog.maint_type = maint_type
    maintLog.maint_sub = maint_sub
    maintLog.maint_personnel = req.info.id.id
    maintLog.add_desc = add_desc

    // now create the maintenance log first
    const newMaintLog = await Maintenance_Log.create({ maintLog })
    if (!newMaintLog) {
        return res.status(500).json({ err: `Error... Unable to create maint log for vehicle with ID of ${vehicle_id}` })
    }
    // now add the log to the vehicle model
    const maint_info = vehicleExist.maint_info
    maint_info.push(newMaintLog)
    const addVehicleMaintLog = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { maint_info }, { new: true, runValidators: true }).populate("maint_info")
    if (!addVehicleMaintLog) {
        return res.status(500).json({ err: `Error... Unable to add maintenance log to vehicle!!!` })
    }
    res.status(StatusCodes.OK).json({ msg: `Maintenance log created and added to vehicle successfully...`, newVehicleInfo: addVehicleMaintLog })

})

const editVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, maint_log_id, maint_type, maint_sub, cost, add_desc } = req.body
    if (req.info.id.role !== 'maintenance_personnel') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Only Maintenance Personnel can make changes to maintenance logs!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const maint_info = vehicleExist.maint_info
    if (!maint_info.includes(maint_log_id)) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Maintenane log not found in vehicle model!!!` })
    }
    const maint_logExist = await Maintenance_Log.findOne({ _id: maint_log_id })
    if (!maint_logExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Maintenence log with ID ${maint_log_id} not found!!!` })
    }
    // now we've established that vehicle and maint_log exist and the vehicle contains the maint_log
    // let us now update the log
    const update = {}
    if (maint_type.trim() !== '') {
        update.maint_type = maint_type.trim()
    }
    if (maint_sub.trim() !== '') {
        update.maint_sub = maint_sub.trim()
    }
    if (cost.trim() !== '') {
        update.cost = cost.trim()
    }
    if (add_desc.trim() !== '') {
        update.add_desc = add_desc.trim()
    }
    const updateLog = await Maintenance_Log.findOneAndUpdate({ _id: maint_log_id }, { $set: update }, { new: true, runValidators: true })

    const updatedVehicleInfo = await Vehicle.findOne({ _id: vehicle_id }).populate("maint_info")

    res.status(StatusCodes.OK).json({ msg: `Vehicle with ID ${vehicle_id} maintenance log updated successfully`, newVehicleInfo: updatedVehicleInfo })
})

// I need more information about the driver's log
const createDailyDriverLog = asyncHandler(async(req, res) => {
    const { vehicle_id, maint_type, cost, add_desc, maint_sub, current_state } = req.body
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
    if (cost.trim !== '') {
        maintLog.cost = cost.trim()
    }
    if (current_state.trim !== '') {
        maintLog.current_state = current_state.trim()
    }

    maintLog.vehicle = vehicle_id
    maintLog.maint_type = maint_type
    maintLog.maint_sub = maint_sub
    maintLog.maint_personnel = req.info.id.id
    maintLog.add_desc = add_desc

    // now create the maintenance log first
    const newMaintLog = await Maintenance_Log.create({ maintLog })
    if (!newMaintLog) {
        return res.status(500).json({ err: `Error... Unable to create maint log for vehicle with ID of ${vehicle_id}` })
    }
    // now add the log to the vehicle model
    const maint_info = vehicleExist.maint_info
    maint_info.push(newMaintLog)
    const addVehicleMaintLog = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { maint_info }, { new: true, runValidators: true })
    if (!addVehicleMaintLog) {
        return res.status(500).json({ err: `Error... Unable to add maintenance log to vehicle!!!` })
    }
    res.status(StatusCodes.OK).json({ msg: `Maintenance log created and added to vehicle successfully...`, newVehicleInfo: addVehicleMaintLog })

})

// this allows anyone who have access to a vehicle to make changes
const updateVehicleInfo = asyncHandler(async(req, res) => {
    // now the maint_info and daily_logs are id
    const { vehicle_id, current_millage, current_state, maint_info, daily_log } = req.body
        //make sure if the user is not a vehicle_coordinator, he has access to the vehicle
    const vehicleAccess = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicle_id) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error.... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const assigned_to = vehicleAccess.assigned_to
    if (assigned_to.length = 0) {
        // then, only the vehicle coordinator is allowed to make such changes
    }
    // now let's ensure only users [vehicle_assignee, maintenance_personnel, and their assigned driver] with access with to the 
    const loggedInUser = await User.findOne({ _id: req.info.id.id })
    const driverPresent = loggedInUser.driver
    if (!assigned_to.includes(req.info.id.id) || driverPresent !== req.info.id.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Only users and asigned drivers with access to the vehicle can make such changes!!!` })
    }

    if (req.info.id.role !== 'vehicle_coordinator' || req.info.id.id) {}
})

// assign a vehicle to an assignee
const assignVehicle = asyncHandler(async(req, res) => {
    const { vehicle_id, assignee_id } = req.body
    if (!vehicle_id || !assignee_id) {
        return res.status(500).json({ err: `Please provide the vehicle and assignee ID!!!` })
    }
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not Authorized to perfom this operation!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const assigneeExist = await User.findOne({ _id: assignee_id })
    if (!assigneeExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... User with ID ${assignee_id} not found!!!` })
    }
    const vehicle = assigneeExist.vehicle
    if (!vehicle.includes(vehicle_id)) {
        vehicle.push(vehicle_id)
    }
    const assignVehicle = await User.findOneAndUpdate({ _id: assignee_id }, { vehicle }, { new: true, runValidators: true })
    if (!assignVehicle) {
        return res.status(500).json({ err: `Error... unable to assign vehicle to ${lastName}!!!` })
    }
    // now add the assignee id to the vehicle
    const assigned_to = vehicleExist.asigned_to
    if (!assigned_to.includes(assignee_id)) {
        assigned_to.push(assignee_id)
    }
    const assignAssignee = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { assigned_to }, { new: true, runValidators: true })
    if (!assignAssignee) {
        return res.status(500).json({ err: `Error... unable to assign vehicle assignee to the vehicle with id ${vehicle_id}` })
    }
    res.status(StatusCodes.OK).json({ msg: `Vehicle assigned to ${assigneeExist.lastName} ${assigneeExist.firstName} successfully`, assigneeInfo: assignVehicle, vehicleInfo: assignAssignee })

})

// deassign a vehicle from all assignees
const deassignVehicle = asyncHandler(async(req, res) => {
    const { vehicle_id } = req.body
    if (!vehicle_id) {
        return res.status(500).json({ err: `Please provide the vehicle's ID!!!` })
    }
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not Authorized to perfom this operation!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    // now fetch and check if assigned to any user and if yes, remove it from the list
    const assignee = await User.find({ vehicle: { $in: [vehicle_id] } })
    if (assignee.length) {
        const clearAssignedTo = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { assigned_to: [] }, { new: true, runValidators: true })
        const deleteResult = await User.deleteMany({ vehicle: { $in: [vehicle_id] } })
        if (!deleteResult && !clearAssignedTo) {
            return res.status(400).json({ err: `Error removing vehicles form previous assignee!!!` })
        }
        return res.status(StatusCodes.OK).json({ msg: `Vehicle with ID ${vehicle_id} deassigned successfully`, vehicleInfo: clearAssignedTo })
    } else {
        return res.status(StatusCodes.OK).json({ msg: `Vehicle is current not assigned to any one`, vehicleInfo: ve })
    }

})

// when deleting vehicle, you are also deleting the maintenece log attached to it, and you are removing the vehicle from any users model/schema.

const deleteVehicle = asyncHandler(async(req, res) => {
    const { vehicle_id } = req.body
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Unauthorized to perform this opeartion!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Vehicle with ID ${vehicle_id} not found!!!` })
    }
    const removeVehicle = await Vehicle.findOneAndDelete({ _id: vehicle_id })
    if (!removeVehicle) {
        return res.status(500).json({ err: `Error... Unable to delete vehicles!!!` })
    }
    // remove all maint_log associated with the vehicle and remove the vehicle id from everywhere

    res.status(StatusCodes.OK).json({ msg: `Vehicle with ID ${vehicle_id} deleted successfully!!!` })
})

module.exports = { addVehicle, adminUpdateVehicleInfo, getAllVehicles, deleteVehicle, assignVehicle, deassignVehicle, createVehicleMaintLog, editVehicleMaintLog }