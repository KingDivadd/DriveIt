const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Vehicle = require('../model/vehicle-model')
const IncedentReport = require('../model/incedent-report-model')
const Notification = require('../model/notification-model')


const newIncedent = asyncHandler(async(req, res) => {
    const { vehicle_id, location, description, image } = req.body
    if (!location || !description || !image.length) {
        return res.status(500).json({ err: `Please fill all fields!!!` })
    }
    if (req.info.id.role === 'driver') {
        return res.status(401).json({ err: `You are not authorized to create report!!!` })
    }
    if (vehicle_id.trim() !== "") {
        req.body.vehicle_id = vehicle_id.trim()
    }
    // now when vehicle_id is empty assuming the assigned personnel will be entering the report
    const user = await User.findOne({ _id: req.info.id.id })
    if (!user.vehicle) {
        return res.status(500).json({ err: `User not assiged to any vehicle` })
    }
    // check if user vehicle exist
    const vehicleExist = await Vehicle.findOne({ _id: user.vehicle })
    if (!vehicleExist) {
        return res.status(404).json({ err: `Vehicle assigned to user was not found, contact admin.` })
    }
    req.body.vehicle_id = user.vehicle
        // now add the report
    const newReport = await IncedentReport.create(req.body)
        //for the admin
    await Notification.create({ title: "New Incedent Report creation", message: `${description}`, vehicleInfo: req.body.vehicle_id, createdBy: req.info.id.id, access: 'admin' })
        //for the vehicle assignee/driver/maint_personnel(assuming he has an assigned vehicle)
    await Notification.create({ title: "New Incedent Report creation", message: `${description}`, vehicleInfo: req.body.vehicle_id, createdBy: req.info.id.id, access: `${req.info.id.role}` })
})

const allIncedentReport = asyncHandler(async(req, res) => {
    const { vehicle_id } = req.body

    if (!vehicle_id) {
        const user = await User.findOne({ _id: req.info.id.id })
        if (!user.vehicle) {
            return res.status(500).json({ err: `User not assiged to any vehicle` })
        }
        // check if user vehicle exist
        const vehicleExist = await Vehicle.findOne({ _id: user.vehicle })
        if (!vehicleExist) {
            return res.status(404).json({ err: `Vehicle assigned to user was not found, contact admin.` })
        }
        req.body.vehicle_id = user.vehicle

        // if logged in user is a driver
        if (req.info.id.role === 'driver') {
            const vehicleOwner = await User.findOne({ driver: req.info.id.id })
            if (!vehicleOwner.vehicle) {
                return res.status(500).json({ err: `User not assiged to any vehicle` })
            }
            const vehicleExist = await Vehicle.findOne({ _id: user.vehicle })
            if (!vehicleExist) {
                return res.status(404).json({ err: `Vehicle assigned to user was not found, contact admin.` })
            }
            req.body.vehicle_id = user.vehicle
        }
    }

    const allReport = await IncedentReport.find({ vehicle: req.body.vehicle_id })
    return res.status(200).json({ nbHit: allReport.length, incedentReports: allReport })
})