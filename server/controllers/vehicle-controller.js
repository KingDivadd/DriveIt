const asyncHandler = require('express-async-handler')
const Vehicle = require('../model/vehicle-model')
const User = require('../model/user-model')
const generateToken = require("../config/generateToken")
const { StatusCodes } = require("http-status-codes")
const sendEmail = require("./email-controller")

// createing a vehicle instance
const addVehicle = asyncHandler(async(req, res) => {
    // console.log(req.info.role, req.info.id)
    const { plate_no, engine_no, current_millage, department, vehicle_type, brand } = req.body

    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: "Error. Not authorized to perform this operation" })
    }
    if (!plate_no || !engine_no || !vehicle_type || !brand || !current_millage) {
        res.status(500).json({ err: "Please enter provide all vehicle information!!!" })
    }
    // check if a vehicle with the entered plate number exist
    const query = {};

    if (plate_no) {
        query.plate_no = { $regex: new RegExp(plate_no, 'i') };
    }
    if (engine_no) {
        query.engine_no = { $regex: new RegExp(engine_no, 'i') };
    }
    const vehicleExist = await Vehicle.find(query)
    if (vehicleExist.length > 0) {
        return res.status(500).json({ err: `Vehicle with Plate NO. ${plate_no} or ENGINE NO ${engine_no} already exist` })
    }

    req.body.added_by = req.info.id.id
    const newVehicle = await Vehicle.create(req.body)
    res.status(StatusCodes.CREATED).json({ new_Vehicle: newVehicle })

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
    const { id: vehicle_id } = req.params
    const { brand, plate_no, vehicle_type, current_millage, engine_no, current_state, department } = req.body
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

    res.status(StatusCodes.OK).json({ msg: "Vehicle Info updated successfully", newInfo: newVehicleInfo })
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