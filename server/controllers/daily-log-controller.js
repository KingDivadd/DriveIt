const asyncHandler = require('express-async-handler')
const Notification = require("../model/notification-model")
const Vehicle = require("../model/vehicle-model")
const DailyLog = require("../model/daily-log-model")
const User = require("../model/user-model")
const { StatusCodes } = require("http-status-codes")

const allLog = asyncHandler(async(req, res) => {
    const { start_date, end_date, filter } = req.body
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
    if (req.info.id.role !== 'driver') {
        // now the user is already logged in and is not a driver
        driver = await User.findOne({ _id: user.driver })
        if (!driver) {
            driver = { msg: "No assigned driver yet!!!" }
        }
    }
    if (!user.vehicle) {
        return res.status(500).json({ msg: `No vehicle assigned to user yet!!!` })
    }
    const vehicle_exist = await Vehicle.findOne({ _id: user.vehicle })
    if (!vehicle_exist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Vehicle not found!!!` })
    }

    const query = {}
    query.vehicle = vehicle_exist._id
    if (start_date && end_date) {
        query.updatedAt = { $gte: `${start_date}T00:00:00.000Z`, $lte: `${end_date}T23:59:59.999Z` }
    }
    if (filter) {
        query.filter = filter
    }
    const allLogs = await DailyLog.find(query)

    if (req.info.id.role !== 'driver') {
        return res.status(200).json({ nbHit: allLogs.length, dailyLogs: allLogs, assignedDriver: driver })
    }
    if (req.info.id.role === 'driver') {
        return res.status(200).json({ nbHit: allLogs.length, dailyLogs: allLogs, vehicleOwner: user })
    }
})

// the info that should be persisted to the vehicle should be inthe evening when the endingMileage has been entered.
const newLog = asyncHandler(async(req, res) => {
    const { vehicle_id, currentLocation, startingMileage, endingMileage, startingFuelLevel, endingFuelLevel, logTime } = req.body
    if (!vehicle_id) {
        return res.status(500).json({ err: `Error... Please select a vehicle!!!` })
    }
    if (!logTime) {
        return res.status(500).json({ err: `Please select log time, morning or evening.` })
    }

    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(404).json({ err: `Error... Vehicle not found!!!` })
    }

    let auth = false
    const assignedTo = vehicleExist.assigned_to
    assignedTo.forEach(async(data, ind) => {
        if (String(data) === req.info.id.id) {
            auth = true
        }
        const user = await User.findOne({ _id: data })
        if (user.driver === req.info.id.id) {
            auth = true
        }
    });
    if (auth === false) {
        return res.status(401).json({ err: `Error... Only staffs assigned to a vehicle are allowed to create vehicle logs!!!` })
    }

    // Now store
    req.body.vehicle = vehicle_id
    req.body.addedBy = req.info.id.id

    const mileage_diff = Number(endingMileage) - Number(startingMileage)
    const daily_mileage = mileage_diff.toLocaleString()

    let current_mileage;
    console.log(logTime, logTime.trim())
    if (logTime.trim() === "morning") {
        req.body.endingFuelLevel = ""
        req.body.endingMileage = ""
        current_mileage = Number(startingMileage).toLocaleString()
    }
    if (logTime.trim() === "evening") {
        req.body.startingFuelLevel = ""
        req.body.startingMileage = ""
        current_mileage = Number(endingMileage).toLocaleString()

    }
    const newDailyLog = await DailyLog.create(req.body)

    await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { current_mileage: current_mileage, daily_mileage: daily_mileage, current_location: currentLocation, $push: { daily_log: newDailyLog._id } }, { new: true, runValidators: true })

    return res.status(200).json({ msg: `Vehicle log created and added successfully...`, dailyLog: newDailyLog })

})

const editLog = asyncHandler(async(req, res) => {
    const { log_id, currentLocation, startingMileage, endingMileage, startingFuelLevel, endingFuelLevel, logTime } = req.body
    if (!log_id) {
        return res.status(500).json({ err: `Please provide the log's id!!!` })
    }
    if (!logTime) {
        return res.status(500).json({ err: `Please select a log time. morning or evening.` })
    }
    const logExist = await DailyLog.findOne({ _id: log_id })
    if (!logExist) {
        return res.status(404).json({ err: `Error... Vehicle with ID ${log_id} not found!!!` })
    }
    const vehicle = await Vehicle.findOne({ _id: logExist.vehicle })
    let auth = false
    const assignedTo = vehicle.assigned_to
    assignedTo.forEach(async(data, ind) => {
        if (String(data) === req.info.id.id) {
            auth = true
        }
        const user = await User.findOne({ _id: data })
        if (user.driver === req.info.id.id) {
            auth = true
        }
    });
    if (auth === false) {
        return res.status(401).json({ err: `Error... Only staffs assigned to a vehicle are allowed to delete vehicle logs!!!` })
    }

    if (startingMileage && !endingMileage) {
        const startingMileage = Number(vehicle.current_mileage.replace(/,/g, '')) - Number(vehicle.daily_mileage.replace(/,/g, ''))
        const mileage_diff = Number(endingMileage) - Number(startingMileage)
        const daily_mileage = mileage_diff.toLocaleString()
        const current_mileage = Number(endingMileage).toLocaleString()
        await Vehicle.findOneAndUpdate({ _id: logExist.vehicle }, { current_mileage, daily_mileage }, { new: true, runValidators: true })
        await DailyLog.findOneAndUpdate({ _id: log_id }, { startingMileage }, { new: true, runValidators: true })
    }
    if (!startingMileage && endingMileage) {
        const endingMileage = Number(vehicle.current_mileage.replace(/,/g, ''))
        const mileage_diff = Number(endingMileage) - Number(startingMileage)
        const daily_mileage = mileage_diff.toLocaleString()
        const current_mileage = Number(endingMileage).toLocaleString()
        await Vehicle.findOneAndUpdate({ _id: logExist.vehicle }, { current_mileage, daily_mileage }, { new: true, runValidators: true })
        await DailyLog.findOneAndUpdate({ _id: log_id }, { endingMileage }, { new: true, runValidators: true })
    }


    let update = {}
    if (startingMileage.trim() !== '') {
        update.startingMileage = startingMileage.trim()
    }
    if (endingMileage.trim() !== '') {
        update.endingMileage = endingMileage.trim()
    }
    if (currentLocation.trim() !== "") {
        update.currentLocation = currentLocation.trim()
    }
    if (logTime.trim() !== '') {
        update.logTime = logTime.trim()
    }
    if (startingFuelLevel.trim() !== 0) {
        update.startingFuelLevel = startingFuelLevel.trim()
    }
    if (endingFuelLevel.trim() !== 0) {
        update.endingFuelLevel = endingFuelLevel.trim()
    }
    console.log(update)
    const updatedLog = await DailyLog.findOneAndUpdate({ _id: log_id }, { $set: update }, { new: true, runValidators: true })
    return res.status(200).json({ msg: `Vehicle log updated successfully...`, updatedLog: updatedLog })

})


const deleteLog = asyncHandler(async(req, res) => {
    const { log_id } = req.body
    const logExist = await DailyLog.findOne({ _id: log_id })
    if (!logExist) {
        return res.status(404).json({ err: `Error... Vehicle log not found!!!` })
    }
    const vehicle = await Vehicle.findOne({ _id: logExist.vehicle })
    let auth = false
    const assignedTo = vehicle.assigned_to
    assignedTo.forEach(async(data, ind) => {
        if (data === req.info.id.id) {
            auth = true
        }
        const user = await User.findOne({ _id: data })
        if (user.driver === req.info.id.id) {
            auth = true
        }
    });
    if (auth === false) {
        return res.status(401).json({ err: `Error... Only staffs assigned to a vehicle are allowed to delete vehicle logs!!!` })
    }

    await Vehicle.findOneAndUpdate({ _id: logExist.vehicle }, { $pull: { daily_log: log_id } }, { new: true, runValidators: true })

    const deleteLog = await DailyLog.findOneAndDelete({ _id: log_id })
    return res.status(200).json({ msg: `Vehicle log deleted successfully...` })
})

module.exports = { allLog, newLog, editLog, deleteLog }