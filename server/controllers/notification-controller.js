const Notification = require("../model/notification-model")
const asyncHandler = require("express-async-handler")
const { StatusCodes } = require("http-status-codes")

const allNotifications = asyncHandler(async(req, res) => {

    const vehAssNotif = await Notification.find({ access: 'vehcle_asignee' })
    const adminNotif = await Notification.find({ access: 'admin' })
    const maintNotif = await Notification.find({ access: 'maintenance_personnel' })
    res.status(200).json({ authorization: 'Admin', adminNotif: adminNotif, authorization: 'Vehicle Assignees', vehAssNotif: vehAssNotif, authorization: 'Maintenance_Personnel', maintNotif: maintNotif })
})

const filterNotifications = asyncHandler(async(req, res) => {
    const { role } = req.body
    const notifications = await Notification.find({ access: { $regex: new RegExp(role, 'i') } })

    return res.status(200).json({ nbHit: notifications.length, Authorization: role, Notifications: notifications })
})
module.exports = { allNotifications, filterNotifications }