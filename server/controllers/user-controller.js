const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Vehicle = require("../model/vehicle-model")
const { StatusCodes } = require("http-status-codes")
const sendEmail = require("./email-controller")
const Notification = require("../model/notification-model")
const MaintLog = require("../model/maint-log-model")
const PlannedMaint = require("../model/plan-maint-model")
const DailyLog = require("../model/daily-log-model")

// this role is restricted to the maintenance personnel and the vehicle coordinators alone
const allUsers = asyncHandler(async(req, res) => {
    const allUser = await User.find({})
    if (!allUser) {
        res.status(500).json({ msg: "Error fetching all users" })
    }
    const users = await User.find({ _id: { $ne: req.info.id.id } })
    if (!users) {
        res.status(500).json({ msg: ' Error fetching users' })
    }
    res.status(200).json({ nbHit: allUser.length, users: users })
})

const getUsers = asyncHandler(async(req, res) => {
    const users = await User.find({})
    res.status(200).json({ nbHit: users.length, users: users })
})

const oneUser = asyncHandler(async(req, res) => {
    const user = await User.findOne({ _id: req.info.id.id })
    if (!user) {
        return res.status(404).json({ err: `Error... User not found!!!` })
    }
    // now after fetching the user, we fetch all info associated with the user
    // first vehicle
    let user_vehicle;
    let vehicle_owner;
    let assigned_driver;
    let maint_log = [];
    let planned_maint = [];
    let daily_log = [];
    let dashboard_info = {}

    if (user.role !== "driver") {
        user_vehicle = await Vehicle.findOne({ assigned_to: { $in: [user._id] } })
        if (!user_vehicle || user_vehicle === null) {
            user_vehicle = { _id: 0, msg: `Unfortunately, no Vehicle has been assigned to user yet!!!` };
            maint_log.push({ _id: 0, err: `Error... No maintenance log available!!!` })
            planned_maint.push({ _id: 0, err: `Error... No planned maintenance log available!!!` })
            daily_log.push({ _id: 0, err: `Error... No daily vehicle log available!!!` })

        }
        if (user_vehicle._id !== 0) {
            maint_log = await MaintLog.find({ vehicle: user_vehicle._id })
            planned_maint = await PlannedMaint.find({ vehicle: user_vehicle._id })
            daily_log = await DailyLog.find({ vehicle: user_vehicle._id })

        }
        if (user.driver === null) {
            assigned_driver = { err: `Error... Driver not assigned yet!!!` }
        }
        if (user.driver) {
            assigned_driver = await User.findOne({ _id: user.driver })
            if (!assigned_driver) {
                assigned_driver = { err: `Error... Driver not found!!!` }
            }
        }

        if (user_vehicle._id !== 0) {
            // dashboard info when vehicle exist
            dashboard_info.major_maint_job = maint_log.length
            dashboard_info.current_location = user_vehicle.current_location
            dashboard_info.total_mileage = user_vehicle.current_mileage;
            dashboard_info.last_recorded_mileage = user_vehicle.daily_mileage
            if (!maint_log.length) {
                dashboard_info.last_recorded_maint = "No maintenance log yet."
            }
            if (maint_log.length) {
                dashboard_info.last_recorded_maint = maint_log.createdAt
            }
            if (!planned_maint.length) {
                dashboard_info.next_maint_date = "34 Jan, 2024"
            }
            if (planned_maint.length) {
                dashboard_info.next_maint_date = planned_maint.proposedTime
            }
        }

        if (user_vehicle._id === 0) {
            // dashboared info when no vehicle exist
            dashboard_info.major_maint_job = "0000"
            dashboard_info.current_location = "Nil"
            dashboard_info.total_mileage = "0000";
            dashboard_info.last_recorded_mileage = "0000"
            dashboard_info.last_recorded_maint = "Nil"
            dashboard_info.next_maint_date = "Nil"

        }

        return res.status(200).json({ loggedInUser: user, vehicle_assignee: user, assigned_driver: assigned_driver, dashboard: dashboard_info, user_vehicle: user_vehicle, maint_log: maint_log, planned_maint: planned_maint, daily_logs: daily_log })
    }

    if (user.role === "driver") {
        vehicle_owner = await User.findOne({ driver: user._id })
        if (!vehicle_owner) {
            vehicle_owner = { err: `Unfortunately, you are yet to be assigned!!!` }
            user_vehicle = { _id: 0, msg: `Unfortunately, no Vehicle has been assigned yet!!!` };
            maint_log.push({ err: `Error... No maintenance log available!!!` })
            planned_maint.push({ err: `Error... No planned maintenance log available!!!` })
            daily_log.push({ err: `Error... No daily vehicle log available!!!` })
        }
        user_vehicle = await Vehicle.findOne({ assigned_to: { $in: [vehicle_owner._id] } })

        if (!user_vehicle || user_vehicle === null) {
            user_vehicle = { _id: 0, msg: `Unfortunately, no Vehicle has been assigned to user yet!!!` };
            maint_log = []
            maint_log.push({ err: `Error... No maintenance log available!!!` })
            planned_maint = []
            planned_maint.push({ err: `Error... No planned maintenance log available!!!` })
            daily_log = []
            daily_log.push({ err: `Error... No daily vehicle log available!!!` })
        }
        if (user_vehicle._id !== 0) {
            maint_log = await MaintLog.find({ vehicle: user_vehicle._id })
            planned_maint = await PlannedMaint.find({ vehicle: user_vehicle._id })
            daily_log = await DailyLog.find({ vehicle: user_vehicle._id })
        }
        if (user.driver === null) {
            assigned_driver = { err: `Error... Driver not assigned yet!!!` }
        }
        if (user.driver) {
            assigned_driver = await User.findOne({ _id: user.driver })
            if (!assigned_driver) {
                assigned_driver = { err: `Error... Driver not found!!!` }
            }
        }

        if (user_vehicle._id !== 0) {
            // dashboard info when vehicle exist
            dashboard_info.major_maint_job = maint_log.length
            dashboard_info.current_location = user_vehicle.current_location
            dashboard_info.total_mileage = user_vehicle.current_mileage;
            dashboard_info.last_recorded_mileage = user_vehicle.daily_mileage
            if (maint_log.length === 0) {
                dashboard_info.last_recorded_maint = "No maintenance log yet."
            }
            dashboard_info.last_recorded_maint = maint_log.createdAt
            if (!planned_maint.length) {

                dashboard_info.next_maint_date = "34 Jan, 2024"
            }
            if (planned_maint.length) {
                dashboard_info.next_maint_date = planned_maint.proposedTime
            }
        }

        if (user_vehicle._id === 0) {
            // dashboared info when no vehicle exist
            dashboard_info.major_maint_job = "0000"
            dashboard_info.current_location = "Nil"
            dashboard_info.total_mileage = "0000";
            dashboard_info.last_recorded_mileage = "0000"
            dashboard_info.last_recorded_maint = "Nil"
            dashboard_info.next_maint_date = "Nil"

        }
        console.log(dashboard_info)

        return res.status(200).json({ loggedInUser: user, vehicle_assignee: vehicle_owner, assigned_driver: user, dashboard: dashboard_info, user_vehicle: user_vehicle, maint_log: maint_log, planned_maint: planned_maint, daily_logs: daily_log })

    }

})

const filterUsers = asyncHandler(async(req, res) => {
    const { firstName, lastName, dept, role } = req.body;

    // Check if all filter values are empty
    // if (!firstName && !lastName && !dept && !role) {
    //     return res.status(400).json({ msg: `Error... At least one filter must be provided` });
    // }

    const query = {};

    if (firstName) {
        query.firstName = { $regex: new RegExp(firstName, 'i') };
    }

    if (lastName) {
        query.lastName = { $regex: new RegExp(lastName, 'i') };
    }

    if (dept) {
        query.dept = { $regex: new RegExp(dept, 'i') };
    }

    if (role) {
        query.role = { $regex: new RegExp(role, 'i') };
    }

    const users = await User.find(query);

    if (!users.length) {
        return res.status(404).json({ msg: `No matching users found` });
    }

    res.status(StatusCodes.OK).json({ nbHit: users.length, users: users });
})

const updateUserInfo = asyncHandler(async(req, res) => {
    const { user_id, firstName, lastName, staffId, phone, pic } = req.body
    if (user_id !== req.info.id.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... You're only allowed to make changes to your accout!!!` })
    }

    const update = {}
    if (firstName.trim() !== '') {
        update.firstName = firstName.trim()
    }
    if (lastName.trim() !== '') {
        update.lastName = lastName.trim()
    }
    if (staffId.trim() !== '') {
        update.staffId = staffId.trim()
    }
    if (phone.trim() !== '') {
        update.phone = phone.trim()
    }
    if (pic.trim() !== '') {
        update.pic = pic.trim()
    }
    const updateInfo = await User.findOneAndUpdate({ _id: req.info.id.id }, { $set: update }, { new: true, runValidators: true })
    if (!updateInfo) {
        return res.status(500).json({ err: `Error... unable to update user info!!!` })
    }
    await Notification.create({ access: 'vehicle_assignee', createdBy: req.info.id.id, title: 'Profile Update', message: `Your profile was updated successfully.`, })

    res.status(StatusCodes.OK).json({ msg: `User info updated successfully`, userInfo: updateInfo })
})

const editPic = asyncHandler(async(req, res) => {
    const { pic } = req.body
        // I want to be able to access the image-upload and excute it from here
})

// Tranfer Driver to a vehicle assignee so the assignee can then add them
const assignDriver = asyncHandler(async(req, res) => {
    const { assignee_id, driver_id } = req.body
    if (req.info.id.role !== 'vehicle_coordinator') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not Authorized to perfom this operation!!!` })
    }
    if (!assignee_id || !driver_id) {
        return res.status(500).json({ err: `Error... Provide the Assignee and Driver's Id` })
    }
    // check if the driver exist
    const driverExist = await User.findOne({ _id: driver_id })
    if (!driverExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... Driver with ID '${driver_id}' not found!!!` })
    }
    // check if the role is 'driver'
    if (driverExist.role !== 'driver') {
        return res.status(StatusCodes.BAD_REQUEST).json({ err: `Error... User whose Id is provided is not a driver!!!` })
    }
    // now check if driver is already assigned to a assignee, if yes remove 
    const assignee = await User.find({ driver: driver_id })
    if (assignee.length > 0) {
        const prevAssignee = await User.findOneAndUpdate({ driver: driver_id }, { driver: null }, { new: true, runValidators: true })
        sendEmail("Driver Transfer/Removal", { firstName: prevAssignee.firstName, info: `We regret to inform you that your driver has been removed/reassigned.`, code: `` }, prevAssignee.email)
    }
    // now add the driver to the newAssignee
    const newAssignee = await User.findOneAndUpdate({ _id: assignee_id }, { driver: driver_id }, { new: true, runValidators: true })

    await Notification.create({ access: 'admin', staffInfo: driver_id, createdBy: req.info.id.id, title: `Driver Assignment`, message: `A driver, ${driverExist.lastName} has been assined to ${newAssignee.lastName} successfully`, })

    await Notification.create({ access: 'vehicle_assignee', staffInfo: driver_id, createdBy: req.info.id.id, title: `Driver Assignment`, message: `A driver, ${driverExist.lastName} has been assined to you successfully`, })

    sendEmail("Driver Assignment", { firstName: newAssignee.firstName, info: `We are pleased to inform you that a driver whose name is below has been assigned to you.`, code: `${driverExist.lastName} ${driverExist.firstName}` }, newAssignee.email)

    res.status(StatusCodes.OK).json({ msg: `Driver has been assed to ${newAssignee.firstName} ${newAssignee.lastName} successfully. `, newAssigneeInfo: newAssignee })

})

// remove drive from an assignee
const removeDriver = asyncHandler(async(req, res) => {
    const { assignee_id } = req.body
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not AUTHORIZED to perform this operation!!!` })
    }
    // make sure only non-drivers are subjected to these feature
    const driver = await User.findOne({ _id: assignee_id })
    if (driver.role === "driver") {
        return res.status(500).json({ err: `Error... Drivers do not have drivers` })
    }
    // now make sure that the assignee driver is not null
    if (driver.driver === null) {
        return res.status(500).json({ msg: `Assignee's driver has already been removed / transfered!!!` })
    }
    const removeDriver = await User.findOneAndUpdate({ _id: assignee_id }, { driver: null }, { new: true, runValidators: true })
    if (!removeDriver) {
        return res.status(500).json({ err: `Error... Unable to remove driver!!!` })
    }
    await Notification.create({ access: 'admin', createdBy: req.info.id.id, title: `Driver Recall`, message: `${removeDriver.lastName}'s Driver has been recalled successfully.` })

    await Notification.create({ access: 'vehicle_assignee', createdBy: req.info.id.id, title: `Driver Recall`, message: `Your driver has been recalled successfully.` })

    sendEmail("Driver Transfer", { firstName: removeDriver.firstName, info: `We regret to inform you that your driver has been removed / transfered.`, code: '' }, removeDriver.email)
    res.status(StatusCodes.OK).json({ msg: `Driver removed successfully`, assigneeInfo: removeDriver })
})

const deleteUser = asyncHandler(async(req, res) => {
    const { user_id } = req.body
    return res.status(200).json({ msg: `Delete feature is still under development.` })
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(401).json({ err: `Error... you're unauthorized to delete user!!!` })
    }
    const user_exist = await User.findOne({ _id: user_id })
    if (!user_exist) {
        return res.status(404).json({ err: "User not found!!!" })
    }
    let removeUser;
    if (user_exist.role === "vehicle_assignee") {
        // remove all my id from all occurances
        const vehicle = await Vehicle.findOne({ assigned_to: { $in: [user_id] } })
        if (vehicle) {
            await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { $pull: { assigned_to: user_id } }, { new: true, runValidators: true })
        }

        removeUser = await User.findOne({ _id: user_id })
    }
    if (user_exist.role === "driver") {

    }
    if (user_exist.role === "maintenance_personnel") {

    }
    if (user_exist.role === "vehicle_coordinator") {

    }
    return res.send({ msg: `Work in progress...` })
        // 

})

module.exports = { editPic, getUsers, updateUserInfo, allUsers, assignDriver, removeDriver, oneUser, filterUsers, deleteUser }