const asyncHandler = require('express-async-handler')
const Vehicle = require('../model/vehicle-model')
const User = require('../model/user-model')
const generateToken = require("../config/generateToken")
const { StatusCodes } = require("http-status-codes")
const sendEmail = require("./email-controller")

// createing a vehicle instance
const addVehicle = asyncHandler(async(req, res) => {
    const { plate_no, engine_no, current_millage, department, vehicle_type, brand } = req.body

    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: "Error. Not authorized to perform this operation" })
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
        return res.status(500).json({ err: `Vehicle with Plate NO. ${plate_no} or ENGINE NO ${engine_no} already exist` })
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
    // const allVehicles = await Vehicle.findOne({ _id: vehicle_id })
    // if (req.info.id.id in allVehicles.driver || req.info.id.role === "vehicle_coordinator") {
    //     if (current_state && current_state.length > 0) {
    //         update.current_state = current_state.map(data => data.trim()).filter(data => data !== '')
    //     }
    // }

    // The above will be done in the maintenance controller and will be linked to the vehicle

    const newVehicleInfo = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { $set: update }, { new: true, runValidators: true })

    res.status(StatusCodes.OK).json({ msg: "Vehicle Info updated successfully", newVehicleInfo: newVehicleInfo })
})

// this allows anyone who have access to a vehicle to make changes
const updateVehicleInfo = asyncHandler(async(req, res) => {
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

module.exports = { addVehicle, adminUpdateVehicleInfo, getAllVehicles, deleteVehicle, assignVehicle, deassignVehicle }