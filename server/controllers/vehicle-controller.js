const asyncHandler = require('express-async-handler')
const Vehicle = require('../model/vehicle-model')
const User = require('../model/user-model')
const Daily_Log = require("../model/daily-log-model")
const Maintenance_Log = require('../model/maint-log-model')
const Notification = require("../model/notification-model")
const PlanMaint = require("../model/plan-maint-model")
const generateToken = require("../config/generateToken")
const { StatusCodes } = require("http-status-codes")
const sendEmail = require("./email-controller")

// createing a vehicle instance
const addVehicle = asyncHandler(async(req, res) => {
    const { brand, vehicle_name, fuel_type, vehicle_color, chasis_no, manufacture_year, vehicle_image, plate_no, current_mileage, engine_no, vehicle_type, } = req.body

    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: "Error. You're not authorized to perform this operation!!!" })
    }
    if (!brand || !vehicle_name || !fuel_type || !vehicle_color || !chasis_no || !manufacture_year || !plate_no || !current_mileage || !engine_no || !vehicle_type) {
        res.status(500).json({ err: "Please provide all vehicle information!!!" })
    }
    // check if a vehicle with the entered plate number exist
    const query = {
        $or: [
            { plate_no: plate_no },
            { engine_no: engine_no },
            { chasis_no: chasis_no },
        ]
    };


    const vehicleExist = await Vehicle.find(query)
    if (vehicleExist.length) {
        return res.status(500).json({ err: `Vehicle with either of Plate NO. ${plate_no}, ENGINE NO ${engine_no} or (and) CHASIS NO ${chasis_no} already exist!!!` })
    }
    req.body.added_by = req.info.id.id
    const service_mileage = Number(current_mileage) + 5000
    req.body.service_mileage = service_mileage.toLocaleString()
    req.body.current_mileage = Number(current_mileage).toLocaleString()
    const newVehicle = await Vehicle.create(req.body)
        // now crate a notification log for this
    await Notification.create({ title: "New Vehicle addition", message: `A new vehicle has been added to the institution's fleet. Click here to view vehicle information`, vehicleInfo: newVehicle._id, createdBy: req.info.id.id, access: 'admin' })
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

const userVehicle = asyncHandler(async(req, res) => {
        let user;
        user = await User.findOne({ _id: req.info.id.id })
        let driver = { msg: "No assigned driver yet!!!" }
        if (req.info.id.role === 'driver') {
            user = await User.findOne({ driver: req.info.id.id })
            if (!user) {
                return res.status(404).json({ err: `Unfortunately, you're not assigned to any vehicle owner yet!!!` })
            }
            driver = await User.findOne({ _id: user.driver })
            if (!driver) {
                return res.status(404).json({ err: `Driver not found` })
            }
        }
        if (!user.vehicle) {
            return res.status(500).json({ msg: `No vehicle assigned to user yet!!!` })
        }
        const vehicle_exist = await Vehicle.findOne({ _id: user.vehicle })
        if (!vehicle_exist) {
            return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle not found!!!` })
        }
        return res.status(200).json({ userVehicle: vehicle_exist })
    })
    // Update vehicle infomation
const adminUpdateVehicleInfo = asyncHandler(async(req, res) => {
    const { vehicle_id, brand, plate_no, vehicle_type, current_mileage, engine_no, current_state, department } = req.body
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... You are unauthorized to perform this operation!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }

    const update = {}
    if (current_mileage.trim() !== '') {
        update.current_mileage = Number(current_mileage.trim()).toLocaleString()
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

    await Notification.create({ createdBy: req.info.id.id, title: "Updating Vehicle Information", vehicleInfo: newVehicleInfo, message: "Vehicle's information has been updated successfully. Click here to view the vehicle new information.", access: 'admin' })

    res.status(StatusCodes.OK).json({ msg: "Vehicle Info updated successfully", newVehicleInfo: newVehicleInfo })
})

// might have to remove this later...
// this allows anyone who have access to a vehicle to make changes
const updateVehicleInfo = asyncHandler(async(req, res) => {
    // now the maint_info and daily_logs are id
    const { vehicle_id, current_mileage, current_state, maint_info, daily_log } = req.body
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
    // make sure the user is not assigned to another vehicle
    if (assigneeExist.vehicle) {
        return res.status(500).json({ err: `Error... User already assigned to a vehicle!!!` })
    }

    const assignVehicle = await User.findOneAndUpdate({ _id: assignee_id }, { vehicle: vehicle_id }, { new: true, runValidators: true })
    if (!assignVehicle) {
        return res.status(500).json({ err: `Error... unable to assign vehicle to ${assigneeExist.lastName}!!!` })
    }
    // now add the assignee id to the vehicle
    const assigned_to = vehicleExist.assigned_to
    if (!assigned_to.includes(assignee_id)) {
        assigned_to.push(assignee_id)
    }
    const assignAssignee = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { assigned_to }, { new: true, runValidators: true })
    if (!assignAssignee) {
        return res.status(500).json({ err: `Error... unable to assign vehicle assignee to the vehicle with id ${vehicle_id}` })
    }
    // there should be 2 notifications, one for the the assigner and 2. for the assignee.
    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, title: "Vehicle Assignment", message: `You have successfully assigned a vehicle to ${assigneeExist.lastName} ${assigneeExist.firstName}. Click here to view full information.`, access: 'admin' })

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, title: "Vehicle Assignment", message: `Congratulations, a vehicle has been assigned to you. Click here to view full information.`, access: 'vehicle_assignee' })

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
    //now fetch and check
    // if assigned to any user and
    // if yes, remove it from the list
    const assignee = await User.find({ vehicle: { $in: [vehicle_id] } })
    if (assignee.length) {
        const clearAssignedTo = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { assigned_to: [] }, { new: true, runValidators: true })
        const deleteResult = await User.findOneAndUpdate({ vehicle: vehicle_id }, { vehicle: null }, { new: true, runValidators: true })
        if (!deleteResult && !clearAssignedTo) {
            return res.status(400).json({ err: `Error removing vehicles form previous assignee!!!` })
        }
        await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, title: "Vehicle Recall", message: `Vehicle with plate no ${vehicleExist.plate_no} has been recalled successfully.`, access: 'admin' })

        await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, title: "Vehicle Recall", message: `Your vehicle has been recalled, a new vehicle is underway`, access: 'vehicle_assignee' })

        return res.status(StatusCodes.OK).json({ msg: `Vehicle with ID ${vehicle_id} recalled successfully`, vehicleInfo: clearAssignedTo })
    } else {
        return res.status(StatusCodes.OK).json({ msg: `Vehicle is current not assigned to any one`, vehicleInfo: '' })
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
    const user = User.find({ vehicle: vehicle_id })
    if (user.length) {
        user.forEach(async data => {
            await User.findOneAndUpdate({ _id: data._id }, { vehicle: null }, { new: true, runValidators: true })
        });
    }
    const dailyLog = await Daily_Log.find({ vehicle: vehicle_id })
    if (dailyLog.length) {
        await Daily_Log.deleteMany({ vehicle: vehicle_id })
    }
    const maint_log = await Maintenance_Log.find({ vehicle: vehicle_id })
    if (maint_log.length) {
        await Maintenance_Log.deleteMany({ vehicle: vehicle_id })
    }
    const notif = await Notification.find({ vehicleInfo: vehicle_id })
    if (notif.length) {
        await Notification.deleteMany({ vehicleInfo: vehicle_id })
    }
    const planMaint = await PlanMaint.find({ vehicle: vehicle_id })
    if (planMaint.length) {
        await PlanMaint.deleteMany({ vehicle: vehicle_id })
    }

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, access: 'admin', title: 'Vehicle Deprovisioning', message: `Vehicle with plate no ${vehicleExist.plate_no} has been deleted successfully.`, })

    res.status(StatusCodes.OK).json({ msg: `Vehicle with ID ${vehicle_id} deleted successfully!!!` })
})

module.exports = { addVehicle, adminUpdateVehicleInfo, getAllVehicles, userVehicle, deleteVehicle, assignVehicle, deassignVehicle }