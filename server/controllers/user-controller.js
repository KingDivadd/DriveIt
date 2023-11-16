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

const getUsers = asyncHandler(async(req, res) => {
    const users = await User.find({})
    res.status(200).json({ nbHit: users.length, users: users })
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

const removeUser = asyncHandler(async(req, res) => {
    const { user_id } = req.body
        // the vehicle assignee should be able to remove drivers assigned to them
    return res.send({ msg: `Work in progress...` })
    if (req.info.id.role !== "vehicle_coordinator") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ err: `Error... You're not authorized to perform this operation` })
    }
    // check if the user still exist
    const userExist = await User.findOne({ _id: user_id })
    if (!userExist) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... User with ID ${user_id} not found!!!` })
    }
    const deleteUser = await User.findOneAndDelete({ _id: user_id })
    res.status(StatusCodes.OK).json({ msg: `${deleteUser.lastName} ${deleteUser.firstName} has been deleted successfully!!!` })
})

module.exports = { editPic, getUsers, updateUserInfo, allUsers, assignDriver, removeDriver, oneUser, filterUsers, removeUser }