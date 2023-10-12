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
    if (pic) {
        const updatedPic = await User.findOneAndUpdate({ _id: req.info.id }, { pic }, { new: true, runValidator: true })
        if (!updatedPic) {
            res.status(500).json({ msg: "Change of name was unsuccessful." })
        }
        res.status(500).json({ msg: "Name changed successfully", user: updatedPic })
    } else {
        res.status(500).json({ msg: "Field is empty, therefore no changes on user name will be make" })
    }
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

})

module.exports = { editName, editPic, editPhone, allUsers }