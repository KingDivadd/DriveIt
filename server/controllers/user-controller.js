const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Vehicle = require("../model/vehicle-model")
const { StatusCodes } = require("http-status-codes")
const sendEmail = require("./email-controller")

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

const oneUser = asyncHandler(async(req, res) => {
    const users = await User.find({})
    if (!users) {
        return res.status(500).json({ err: `Error.... Unable to fetch users!!!` })
    }
    res.status(500).json({ userInfos: users })
})

const filterUsers = asyncHandler(async(req, res) => {
    const { firstName, lastName, dept, role } = req.body;

    // Check if all filter values are empty
    if (!firstName && !lastName && !dept && !role) {
        return res.status(400).json({ msg: `Error... At least one filter must be provided` });
    }

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

    res.status(StatusCodes.OK).json({ users: users });
})

const updateUserInfo = asyncHandler(async(req, res) => {
    const { id: user_id } = req.params
    const { firstName, lastName, staffId, phone, pic } = req.body
    if (user_id !== req.info.id.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not Authorized to make changes` })
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
    sendEmail("Driver Transfer", { firstName: removeDriver.firstName, info: `We regret to inform you that your driver has been removed / transfered.`, code: '' }, removeDriver.email)
    res.status(StatusCodes.OK).json({ msg: `Driver removed successfully`, assigneeInfo: removeDriver })
})


const assignVehicleToDriver = asyncHandler(async(req, res) => {
    const { id: user_id } = req.params
    const { vehicle_id } = req.body
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Not authorized to perform this operation` })
    }
    // new check if vehicle_id exist
    const vehicleExist = await Vehicle.findOne({ _id: vehicle_id })
    if (!vehicleExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Vehicle with ID ${vehicle_id} not found` })
    }
    // If found add to the list and make sure it doesn't exist trice.
    const user = await User.findOne({ _id: user_id })
    const vehicle = user.vehicle
    if (vehicle.includes(vehicle_id)) {
        return res.status(500).json({ err: `Error... Vehicle is already added to ${user.name}` })
    }
    // If it doesn't exist add to the list
    vehicle.push(vehicle_id)
    const updateUser = await User.findOneAndUpdate({ _id: user_id }, { vehicle }, { new: true, runValidators: true })
    if (!updateUser) {
        return res.status(500).json({ err: `Error... Unable to add vehicle to ${user.name}` })
    }
    // now add the user_id to the vehicle model
    const editVehicle = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { added_to: user_id }, { new: true, runValidators: true })

    res.status(StatusCodes.OK).json({ userInfo: updateUser })

})
const removeUser = asyncHandler(async(req, res) => {
    const { id: user_id } = req.params

    // the vehicle assignee should be able to remove drivers assigned to them

    const asignee = await User.findOne({ _id: req.info.id.id })
    if (asignee.driver && asignee.driver === user_id) {
        const deleteUser = await User.findOneAndDelete({ _id: asignee.driver })
        if (!deleteUser) {
            return res.status(500).json({ err: `Error... Unable to delete User!!!` })
        }
        const deleteUserAuth = await Auth.findOne({ userId: asignee.driver })
        if (!deleteUserAuth) {
            return res.status(500).json({ err: `Error... Unable to delete User Auth!!!` })
        }
        res.status(StatusCodes.OK).json({ msg: `User with id ${asignee.driver} deleted successfully` })
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not AUTHORIZED to delete user` })
    }
    // the vehicle-coordinator should be able to delet drivers
    if (req.info.id.role === 'vehicle_coordinator') {
        const getUserInfo = await User.findOne({ _id: user_id })
        if (!getUserInfo) {
            return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... user with id ${user_id} not found` })
        }
        // now ensure that the vehicle-coordinator only deletes drivers
        if (getUserInfo.role !== 'driver') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... Not AUTHORIZED to remove user..` })
        }
        const deleteUser = await User.findOneAndDelete({ _id: user_id })
        if (!deleteUser) {
            return res.status(500).json({ err: `Error... Unable to delete User!!!` })
        }
        const deleteUserAuth = await Auth.findOne({ userId: asignee.driver })
        if (!deleteUserAuth) {
            return res.status(500).json({ err: `Error... Unable to delete User Auth!!!` })
        }
        res.status(StatusCodes.OK).json({ msg: `User with id ${user_id} deleted successfully` })
    }

})

module.exports = { editPic, updateUserInfo, allUsers, assignDriver, removeDriver, oneUser, filterUsers, removeUser, assignVehicleToDriver }