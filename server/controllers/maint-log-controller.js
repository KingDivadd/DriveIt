const asyncHandler = require('express-async-handler')
const Maintenance_Log = require('../model/maint-log-model')
const Vehicle = require("../model/vehicle-model")
const { StatusCodes } = require('http-status-codes')
const Notification = require("../model/notification-model")
const User = require("../model/user-model")
const PlanMaint = require("../model/plan-maint-model")

//services is an array and concerns is string
const planMaint = asyncHandler(async(req, res) => {
    const { vehicle, services, concerns, proposedDate } = req.body
    const vehicleExist = await Vehicle.findOne({ _id: vehicle })
    if (!vehicleExist) {
        return res.status(404).json({ err: `Error... Vehicle not found!!!` })
    }
    let auth = false
    const assignedTo = vehicleExist.assigned_to


    if (req.info.id.role !== "vehicle_coordinator" && !assignedTo.length) {
        return res.status(401).json({ err: `Error... You're not authorized to plan maintenance for this vehicle!!!` })
    }

    if (req.info.id.role === "vehicle_coordinator") {
        auth = true
    }

    console.log('assigned to ', Array.isArray(assignedTo))
    if (assignedTo.length) {
        assignedTo.forEach(async(data, ind) => {
            if (String(data) === req.info.id.id) {
                auth = true
            }
            const user = await User.findOne({ _id: String(data) })
            if (user.driver === req.info.id.id) {
                auth = true
            }
        })
    }
    if (!auth) {
        return res.status(401).json({ err: `Error... not authorized to plan maintenance!!!` })
    }
    if (!services.length || !concerns.length) {
        return res.status(500).json({ err: `Error... Please provide necessary informations to plan maintenance!!!` })
    }
    req.body.plannedBy = req.info.id.id
    req.body.proposedDate = { $gte: `${proposedDate}T00:00:00.000Z`, $lte: `${proposedDate}T23:59:59.999Z` }

    const newPlannedMaint = await PlanMaint.create(req.body)

    await Vehicle.findOneAndUpdate({ _id: vehicle }, { $push: { planned_maint_logs: newPlannedMaint } }, { new: true, runValidators: true })

    await Notification.create({ title: `New Planned Maintenance`, access: `vehicle_assignee`, createdBy: req.info.id.id, message: `You've successfully created a maintenance plan.`, vehicleInfo: vehicle, planMaintInfo: newPlannedMaint._id })

    await Notification.create({ title: `New Planned Maintenance`, access: `maintenance_personnel`, createdBy: req.info.id.id, message: `A maintenance plan has been created for a vehicle. Click here to know more`, vehicleInfo: vehicle, planMaintInfo: newPlannedMaint._id })

    return res.status(200).json({ msg: `Maintenence planned successfully`, planedMaint: newPlannedMaint })

})

const editPlannedMaint = asyncHandler(async(req, res) => {
    const { planMaintLog, services, concerns, proposedDate } = req.body
    const planMaintExist = await PlanMaint.findOne({ _id: planMaintLog })
    if (!planMaintExist) {
        return res.status(200).json({ err: `Error... Planned Maintenance log not found!!!` })
    }
    let update = {}
    if (services.length) {
        update.services = services
    }
    if (concerns.length) {
        update.concerns = concerns
    }
    req.body.proposedDate = { $gte: `${proposedDate}T00:00:00.000Z`, $lte: `${proposedDate}T23:59:59.999Z` }
    const updatePlanMaint = await PlanMaint.findOneAndUpdate({ _id: planMaintLog }, { $set: update }, { new: true, runValidators: true })

    await Notification.findOneAndUpdate({ planMaintInfo: planMaintLog }, { title: `Updated Planned Maintenance`, message: `You've successfully updated the maintenance plan.`, }, { new: true, runValidators: true })

    await Notification.findOneAndUpdate({ planMaintInfo: planMaintLog }, { title: `Updated Planned Maintenance`, message: `A maintenance plan for a vehicle just got updated. Click here to know more`, }, { new: true, runValidators: true })

    return res.status(200).json({ msg: `Planned Maintenance log updated successfully`, updatedPlanMaint: updatePlanMaint })
})

const allPlannedMaint = asyncHandler(async(req, res) => {
    const { vehicle, start_date, end_date } = req.body
    const vehicleExist = await Vehicle.findOne({ _id: vehicle })
    if (!vehicleExist) {
        return res.status(404).json({ err: `Error... Vehicle not found!!!` })
    }
    const query = {}
    if (start_date && end_date) {
        query.updatedAt = { $gte: `${start_date}T00:00:00.000Z`, $lte: `${end_date}T23:59:59.999Z` }
    }
    query.vehicle = vehicle
    const allPlannedMaint = await PlanMaint.find(query)
    return res.status(200).json({ nbHit: allPlannedMaint.length, allPlannedMaint: allPlannedMaint })

})

const allVehicleMaintLog = asyncHandler(async(req, res) => {
    const { start_date, end_date, filter } = req.body
        // for each logged in user

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
    let query = {}
    query.vehicle = user.vehicle
    if (start_date && end_date) {
        query.updatedAt = { $gte: `${start_date}T00:00:00.000Z`, $lte: `${end_date}T23:59:59.999Z` }
    }
    if (filter) {
        query.filter = filter
    }
    const maint_log = await Maintenance_Log.find(query)
    return res.status(200).json({ nbHit: maint_log.length, maint_logs: maint_log, })
})

const createVehicleMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, issues, solutions, cost } = req.body
    if (req.info.id.role !== "maintenance_personnel") {
        return res.status(401).json({ err: `Error... You're not authorized to create maintenance log!!!` })
    }
    if (!vehicle_id) {
        return res.status(500).json({ err: `Error... Please select a vehicle!!!` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle with ID ${vehicle_id} not found!!!` })
    }
    if (!issues.length || !solutions.length) {
        return res.status(500).json({ err: `Error... Please provide the issues and the solutions offered.` })
    }
    req.body.maint_personnel = req.info.id.id
    const newCost = Number(cost).toLocaleString()
    req.body.cost = newCost
    req.body.vehicle = vehicle_id
        // now create the maintenance log first
    const newMaintLog = await Maintenance_Log.create(req.body)
    if (!newMaintLog) {
        return res.status(500).json({ err: `Error... Unable to create maint log for vehicle with ID of ${vehicle_id}` })
    }
    // now add the log to the vehicle model

    await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { $push: { maint_logs: newMaintLog } }, { new: true, runValidators: true }).populate("maint_logs")

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, maintLogInfo: newMaintLog.id, title: "Vehicle Maintenance log.", message: `A new maintenance log has been added to the vehicle vehicle. Click here to view full information.`, access: 'maintenance_personnel' })

    await Notification.create({ createdBy: req.info.id.id, vehicleInfo: vehicle_id, maintLogInfo: newMaintLog.id, title: "Vehicle Maintenance log.", message: `A new maintenance log has been added to your vehicle vehicle. Click here to view full information.`, access: 'vehicle_assignee' })
    res.status(StatusCodes.OK).json({ msg: `Maintenance log created and added to vehicle successfully...`, newVehicleInfo: newMaintLog })

})
const editVehicleMaintLog = asyncHandler(async(req, res) => {
    const { maint_log, issues, solutions, cost } = req.body
    if (req.info.id.role !== 'maintenance_personnel') {
        return res.status(401).json({ err: `Error... Only Maintenance Personnel can make changes to maintenance logs!!!` })
    }
    if (!maint_log) {
        return res.status(500).json({ err: `Error... Please select the maintenance log to edit!!!` })
    }
    const maintLogExist = await Maintenance_Log.findOne({ _id: maint_log })
    if (!maintLogExist) {
        return res.status(404).json({ err: `Error... Maintenane log not found!!!` })
    }
    const update = {}
    if (issues.length) {
        update.issues = issues
    }
    if (solutions.length) {
        update.solutions = solutions
    }
    if (cost.trim() !== '') {
        update.cost = Number(cost.trim()).toLocaleString()
    }
    const updateLog = await Maintenance_Log.findOneAndUpdate({ _id: maint_log }, { $set: update }, { new: true, runValidators: true })

    await Notification.create({ createdBy: req.info.id.id, maintLogInfo: maint_log, title: "Vehicle Maintenance log.", message: `A maintenance log for a vehicle has been updated successfully. Click here to view full information.`, access: 'maintenance_personnel' })

    await Notification.create({ createdBy: req.info.id.id, maintLogInfo: maint_log, title: "Vehicle Maintenance log.", message: `A maintenance log for your vehicle has been updated successfully. Click here to view full information.`, access: 'vehicle_assignee' })


    res.status(StatusCodes.OK).json({ msg: `Maintenance log updated successfully`, updatedVehicleMaintLog: updateLog })
})




module.exports = { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog, planMaint, editPlannedMaint, allPlannedMaint }