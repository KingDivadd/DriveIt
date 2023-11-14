const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Vehicle = require("../model/vehicle-model")
const { StatusCodes } = require("http-status-codes")

const allUsers = asyncHandler(async(req, res) => {
    const allUser = await User.find({})
    if (!allUser) {
        res.status(500).json({ msg: "Error fetching all users" })
    }
    const loggedInUser = await User.findOne({ _id: req.info.id.id })
    if (!loggedInUser) {
        res.status(500).json({ msg: ' Error, USER NOT FOUND. the Developer should be questioned, Because how come' })
    }
    res.status(200).json({ nbHit: allUser.length, LoggedInUser: loggedInUser, AllUsers: allUser, })
})

const getUsers = asyncHandler(async(req, res) => {
    const users = await User.find({})
    if (!users) {
        return res.status(500).json({ err: `Error.... Unable to fetch users!!!` })
    }
    res.status(500).json({ userInfos: users })
})

const oneUser = asyncHandler(async(req, res) => {
    const { email } = req.body
    const oneUser = await User.findOne({ email })
    if (!oneUser) {
        res.status(400).json({ msg: `${email} is not a registered email address!!!` })
    }
    res.status(200).json({ userInfo: oneUser })
})

const editPic = asyncHandler(async(req, res) => {
    const { pic } = req.body
        // I want to be able to access the image-upload and excute it from here
})



// Add driver to Profile -- Only available to vehicle assignee and Vehicle coordinator
const addDriver = asyncHandler(async(req, res) => {
    const { driver_id } = req.body
        // find user and ensure, his role is a driver.
    const verifyDriver = await User.findOne({ _id: driver_id })
    if (verifyDriver.role === "driver") {
        const addDriver = await User.findByIdAndUpdate({ _id: req.info.id.id }, { driver: driver_id }, { new: true, runValidator: true })
        res.status(200).json({ LoggedInUser: addDriver })
    }
    res.status(500).json({ msg: "Selected user isn't a driver." })
})

// Tranfer Driver from on dept to another
const transferDriver = asyncHandler(async(req, res) => {
        const { driver_id, dept } = req.body
        const verifyDriver = await User.findOne({ _id: driver_id })
            // ensure that the person about to make the transfer is a vehicle coordinator
        if (req.info.role === "vehicle_coordinator") {
            if (verifyDriver.role === "driver") {
                const transerDriver = await User.findByIdAndUpdate({ _id: driver_id }, { dept }, { new: true, runValidator: true })
                res.status(200).json({ transferedDriver: transerDriver })
            }
            res.status(200).json({ msg: "Error, user is not a driver." })
        }
        res.status(500).json({ msg: "Not authorized to perform this opeartion" })
    })
    // ---------------------#################################-----------------------------------
    // should only be done by the logged in user
const updateUserInfo = asyncHandler(async(req, res) => {
        const { name, phone, } = req.body
        const update = {}
            // should be able to change [name, phone, pic]
        if (name.trim() !== '') {
            update.name = name.trim()
        }
        if (phone.trim() !== '') {
            update.phone = phone.trim()
        }
        // if (pic.trim() !== ''){
        //     update.pic = pic.trim()
        // }
        const updateInfo = await User.findOne({ _id: req.info.id.id }, { name, phone }, { new: true, runValidators: true })
        if (!userInfo) {
            return res.status(500).json({ err: `Error... unable to update user info!!!` })
        }
        res.status(StatusCodes.OK).json({ msg: `User info updated successfully`, userInfo: updateInfo })
    })
    // ---------------------#################################-----------------------------------
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

module.exports = { editPic, updateUserInfo, allUsers, addDriver, transferDriver, oneUser, getUsers, removeUser, assignVehicleToDriver }