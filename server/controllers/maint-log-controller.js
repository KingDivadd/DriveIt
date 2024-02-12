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
    if (!vehicle || !proposedDate || !services.length || !concerns) {
        return res.status(500).json({ err: `Error... Please fill all fields!!!` })
    }
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
    if (!services.length || !concerns) {
        return res.status(500).json({ err: `Error... Please provide necessary informations to plan maintenance!!!` })
    }
    req.body.plannedBy = req.info.id.id

    const maint_id = await PlanMaint.find({ vehicle: vehicle })
    let maint_id_box = []
    if (maint_id.length) {
        maint_id.forEach((data, ind) => {
            let id = data.maint_id
            let split_id = id.split('-')
            let newId = split_id[split_id.length - 1]
            maint_id_box.push(Number(newId.replace(/,/g, '')))
        });

        latest_maint_id = Math.max(...maint_id_box)
        let maint_idd = latest_maint_id + 1
        let new_maint_id = String(maint_idd).padStart(4, "0")
        let prefix = 'FUTWORKS-'
        req.body.maint_id = prefix.concat(new_maint_id)
    }
    if (!maint_id.length) {
        req.body.maint_id = "FUTWORKS-0001"
    }

    const newPlannedMaint = await PlanMaint.create(req.body)

    await Vehicle.findOneAndUpdate({ _id: vehicle }, { $push: { planned_maint: newPlannedMaint } }, { new: true, runValidators: true })

    await Notification.create({ title: `New Planned Maintenance`, access: `vehicle_assignee`, createdBy: req.info.id.id, message: `You've successfully created a maintenance plan.`, vehicleInfo: vehicle, planMaintInfo: newPlannedMaint._id })

    await Notification.create({ title: `New Planned Maintenance`, access: `maintenance_personnel`, createdBy: req.info.id.id, message: `A maintenance plan has been created for a vehicle. Click here to know more`, vehicleInfo: vehicle, planMaintInfo: newPlannedMaint._id })

    return res.status(200).json({ msg: `Maintenence planned successfully`, planedMaint: newPlannedMaint })

})

const editPlannedMaint = asyncHandler(async(req, res) => {
    const { planMaintLog, services, concerns, proposedDate, status } = req.body
    const planMaintExist = await PlanMaint.findOne({ _id: planMaintLog })
    if (!planMaintExist) {
        return res.status(200).json({ err: `Error... Planned Maintenance log not found!!!` })
    }
    let update = {}
    if (services.length) {
        update.services = services
    }
    if (concerns.trim() !== "") {
        update.concerns = concerns.trim()
    }
    if (proposedDate.trim() !== '') {
        update.proposedDate = proposedDate.trim()
    }
    if (status.trim() !== '') {
        if (['pending', 'in-shop', 'in-progress', 'completed'].includes(status) === false) {
            return res.status(500).json({ err: `Error... Check your code. the allowed enums are 'pending', 'in-shop', 'in-progress', and 'completed'` })
        }
        update.status = status.trim()
    }
    const updatePlanMaint = await PlanMaint.findOneAndUpdate({ _id: planMaintLog }, { $set: update }, { new: true, runValidators: true })

    await Notification.findOneAndUpdate({ planMaintInfo: planMaintLog }, { title: `Updated Planned Maintenance`, message: `You've successfully updated the maintenance plan.`, }, { new: true, runValidators: true })

    await Notification.findOneAndUpdate({ planMaintInfo: planMaintLog }, { title: `Updated Planned Maintenance`, message: `A maintenance plan for a vehicle just got updated. Click here to know more`, }, { new: true, runValidators: true })

    return res.status(200).json({ msg: `Planned Maintenance log updated successfully`, updatedPlanMaint: updatePlanMaint })
})

const updatePlannedMaintStatus = asyncHandler(async(req, res) => {
    const { maint_id, status } = req.body
    if (!maint_id) {
        return res.status(500).json({ err: `Please provide the maintenance log id.` })
    }
    if (!status || status.trim() === "") {
        return res.status(500).json({ err: `Please select current vehicle maintenance status.` })
    }
    const logExist = await PlanMaint.findOne({ _id: maint_id })
    if (!logExist) {
        return res.status(404).json({ err: `Maintenance log not found. Contact support.` })
    }
    if (req.info.id.role !== 'maintenance_personnel') {
        return res.status(401).json({ err: `Only maintenance personnel are authorized to perform such operation.` })
    }


    const updateStatus = await PlanMaint.findOneAndUpdate({ _id: maint_id }, { status: status.trim() }, { new: true, runValidators: true })

    // const user = await User.find({ vehicle: updateStatus.vehicle })

    // await Notification.findOneAndUpdate({ planMaintInfo: updateStatus }, { title: `You've update a vehicle maintenance status`, message: `A vehicle maintenance status has been updated successfully.`, }, { new: true, runValidators: true })

    // await Notification.findOneAndUpdate({ planMaintInfo: updateStatus }, { title: `Updated Planned Maintenance`, message: `A maintenance plan for a vehicle just got updated. Click here to know more`, }, { new: true, runValidators: true })


    return res.status(200).json({ msg: `Vehicle maintenance status changed to ${status} successfully`, maintenanceStatus: updateStatus })

})

const allPlannedMaint = asyncHandler(async(req, res) => {
    const { vehicle, start_date, end_date } = req.body
    if (!vehicle) {
        return res.status(500).json({ err: `Please provide vehicle's id!!!` })
    }
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

const allVehiclesPlannedMaint = asyncHandler(async(req, res) => {
    const { start_date, end_date, status } = req.body
    const query = {}
    if (start_date && end_date) {
        query.updatedAt = { $gte: `${start_date}T00:00:00.000Z`, $lte: `${end_date}T23:59:59.999Z` }
    }
    if (status && status.trim() !== "") {
        query.status = status.trim()
    }

    const planMaint = await PlanMaint.find(query)
    return res.status(200).json({ nbHit: planMaint.length, allVehiclesPlannedMaint: planMaint })

})


const onePlannedMaint = asyncHandler(async(req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(500).json({ err: `Error... Please select a maintenance log to view related info.` })
    }
    const user = await User.findOne({ _id: req.info.id.id })
    const maintExist = await PlanMaint.findOne({ _id: id, })

    const maintLog = await PlanMaint.findOne({ _id: id })
    if (!maintLog) {
        return res.status(404).json({ err: `Selected maintenance log not found or has been deleted.` })
    }
    return res.status(200).json({ msg: `Fetching log...`, maint_log: maintLog })
})

const addMaintPersonnelFeedback = asyncHandler(async(req, res) => {
    const { maint_id, issues, repair_done, completion_date, images } = req.body

    if (!maint_id) {
        return res.status(500).json({ err: `Error... Please select a maintenance log to view related info.` })
    }
    if (!issues || !repair_done.length || !completion_date) {
        return res.status(500).json({ err: `Error... Please fill all fields.` })
    }
    if (req.info.id.role !== "maintenance_personnel") {
        return res.status(401).json({ err: `Only Maintenance Personnel are authorized to perform this operation.` })
    }
    const planMaintExist = await PlanMaint.findOne({ _id: maint_id })
    if (!planMaintExist) {
        return res.status(404).json({ err: `Maintenance Log not found.` })
    }
    // now we can make changes to the personnel feedback,  but first we want to ensure
    const update = {}
    if (issues.trim() !== "") {
        update.issues = issues.trim()
    }
    if (repair_done.length) {
        update.repair_done = repair_done
    }
    if (completion_date.trim() !== "") {
        update.completion_date = completion_date.trim()
    }
    if (images.length) {
        update.images = images
    }

    const addFeedback = await PlanMaint.findOneAndUpdate({ _id: maint_id }, { personnelFeedback: update }, { new: true, runValidators: true })

    const vehicle_id = addFeedback.vehicle

    const user = await User.find({ vehicle: vehicle_id })

    await Notification.create({ createdBy: req.info.id.id, title: "Maintenance Personnel Feedback", planMaint: addFeedback, message: `${req.info.id.lastName} ${req.info.id.firstName}, a maintenance personnel just addded a feedback to a planned maintenance job`, access: 'admin' })

    await Notification.create({ createdBy: req.info.id.id, title: "Maintenance Personnel Feedback", planMaint: addFeedback, message: `${req.info.id.lastName} ${req.info.id.firstName} just addded a feedback to a planned maintenance job`, access: 'maintenance_personnel' })

    if (user.length && user.includes(req.info.id.id)) {
        await Notification.create({ createdBy: req.info.id.id, title: "Maintenance Personnel Feedback", planMaint: addFeedback, message: "Maintenance Psersonnel just added a feedback to your planned mainteance job", access: 'vehicle_assignee' })
    }

    return res.status(200).json({ msg: `Maintenance Personnel feedback added successfully.`, planMaintLog: addFeedback })

})

const editMaintPersonnelFeedback = asyncHandler(async(req, res) => {
    const { maint_id, issues, repair_done, completion_date, images } = req.body

    if (!maint_id) {
        return res.status(500).json({ err: `Please select a maint log to edit.` })
    }
    if (req.info.id.role !== "maintenance_personnel") {
        return res.status(401).json({ err: `Only Maintenance Personnel are authorized to perfom this operation.` })
    }
    const planMaintExist = await PlanMaint.findOne({ _id: maint_id })
    if (!planMaintExist) {
        return res.status(404).json({ err: `Maintenance Log not found.` })
    }

    // now update log

    const personnelFeedback = {}
    if (issues.trim() !== "") {
        personnelFeedback.issues = issues.trim()
    }
    if (repair_done.length) {
        personnelFeedback.repair_done = repair_done
    }
    if (completion_date.trim() !== "") {
        personnelFeedback.completion_date = completion_date.trim()
    }
    if (images.length) {
        personnelFeedback.images = images
    }

    const updatePersonnelFeedback = await PlanMaint.findOneAndUpdate({ _id: maint_id }, { personnelFeedback: personnelFeedback }, { new: true, runValidators: true })
        .populate("personnelFeedback")

    await Notification.create({ createdBy: req.info.id.id, title: "Maintenance Feedback updated successfully", planMaintInfo: updatePersonnelFeedback, message: `You've updated the maintenance feedback successfuly`, access: 'maintenance_personnel' })

    return res.status(200).json({ msg: `Maintenance feedback updated successfully`, planMaintLog: updatePersonnelFeedback })
})

const addVehicleOwnersFeedback = asyncHandler(async(req, res) => {
    const { maint_id, rating, feedback } = req.body

    if (!maint_id) {
        return res.status(500).json({ err: `Please select a maintenance log.` })
    }
    const planMaintExist = await PlanMaint.findOne({ _id: maint_id })
    if (!planMaintExist) {
        return res.status(404).json({ err: `Maintenance Log not found.` })
    }
    if (!rating || !feedback) {
        return res.status(500).json({ err: `Please fill al fields.` })
    }
    // now let ensure only people assigned to the vehicle can write feedback
    const user = await User.findOne({ _id: req.info.id.id })
    if (String(user.vehicle) !== String(planMaintExist.vehicle)) {
        return res.status(401).json({ err: `Only users assigned to vehicle can add feedback.` })
    }
    // now let add
    const plannersFeedback = {}
    if (rating.trim() !== '') {
        plannersFeedback.rating = rating.trim()
    }
    if (feedback.trim() !== '') {
        plannersFeedback.feedback = feedback.trim()
    }

    const newFeedback = await PlanMaint.findOneAndUpdate({ _id: maint_id }, { plannersFeedback: plannersFeedback }, { new: true, runValidators: true })

    return res.status(200).json({ msg: `You've succcessfully added your feedback.`, maintLog: newFeedback })


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

const allMaintLog = asyncHandler(async(req, res) => {
    const { vehicle_id, start_date, end_date, filter } = req.body
    if (!vehicle_id || vehicle_id.trim() === '') {
        return res.status(500).json({ err: `Please provide vehicle id` })
    }
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(404).json({ err: `Vehicle with provided id, not found.` })
    }
    let query = {}
    query.vehicle = vehicle_id
    if (start_date && end_date) {
        query.createdAt = { $gte: start_date, $lte: end_date }
    }
    if (filter) {
        query.filter = filter
    }
    // now fetch the maintlog
    const maintLogs = await Maintenance_Log.find(query)
    return res.status(200).json({ nbHit: maintLogs.length, allVehicleMaintLog: maintLogs })
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


module.exports = { allVehicleMaintLog, createVehicleMaintLog, editVehicleMaintLog, planMaint, editPlannedMaint, allPlannedMaint, onePlannedMaint, addMaintPersonnelFeedback, editMaintPersonnelFeedback, addVehicleOwnersFeedback, updatePlannedMaintStatus, allMaintLog, allVehiclesPlannedMaint }