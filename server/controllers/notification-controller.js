const Notification = require("../model/notification-model")
const asyncHandler = require("express-async-handler")
const { StatusCodes } = require("http-status-codes")

const allNotifications = asyncHandler(async(req, res) => {
    const allNot = await Notification.find({})
    res.status(200).json({ nbHit: allNot.length, notifications: allNot })
})

module.exports = { allNotifications }