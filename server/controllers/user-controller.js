const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')

const allUsers = asyncHandler(async(req, res) => {
    const allUser = await User.find({})
    if (!allUser) {
        res.status(500).json({ msg: "Error fetching all users" })
    }
    const loggedInUser = await User.findOne({ _id: req.info.id })
    if (!loggedInUser) {
        res.status(500).json({ msg: ' Error, USER NOT FOUND. the Developer should be questioned, Because how come' })
    }
    res.status(200).json({ nbHit: allUser.length, LoggedInUser: loggedInUser, AllUsers: allUser, })
})

const oneUser = asyncHandler(async(req, res) => {
    const { email } = req.body
    const oneUser = await User.findOne({ email })
    if (!oneUser) {
        res.status(400).json({ msg: `${email} is not a registered email address!!!` })
    }
    res.status(200).json({ userInfo: oneUser })
})

const editName = asyncHandler(async(req, res) => {
    const { name } = req.body
    if (name) {
        const updatedName = await User.findOneAndUpdate({ _id: req.info.id }, { name }, { new: true, runValidator: true })
        if (!updatedName) {
            res.status(500).json({ msg: "Change of name was unsuccessful." })
        }
        res.status(200).json({ msg: "Name changed successfully", user: updatedName })
    } else {
        res.status(500).json({ msg: 'Field is empty, therefore no changes will be makde' })
    }
})

const editPic = asyncHandler(async(req, res) => {
    const { pic } = req.body
        // I want to be able to access the image-upload and excute it from here
})


const editPhone = asyncHandler(async(req, res) => {
    const { phone } = req.body
    if (phone) {
        const updatedPhone = await User.findOneAndUpdate({ _id: req.info.id }, { phone }, { new: true, runValidator: true })
        if (!updatedPhone) {
            res.status(500).json({ msg: "Change of name was unsuccessful." })
        }
        res.status(500).json({ msg: "Name changed successfully", user: updatedPhone })
    } else {
        res.status(500).json({ msg: "Field is empty, therefore no changes on user name will be make" })
    }
})

// Add driver to Profile -- Only available to vehicle assignee and Vehicle coordinator
const addDriver = asyncHandler(async(req, res) => {
    const { driver_id } = req.body
        // find user and ensure, his role is a driver.
    const verifyDriver = await User.findOne({ _id: driver_id })
    if (verifyDriver.role === "driver") {
        const addDriver = await User.findByIdAndUpdate({ _id: req.info.id }, { driver: driver_id }, { new: true, runValidator: true })
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

module.exports = { editName, editPic, editPhone, allUsers, addDriver, transferDriver, oneUser }