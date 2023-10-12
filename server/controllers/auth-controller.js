const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Auth = require("../model/auth-model")
const bcrypt = require('bcrypt')
const generateToken = require('../config/generateToken')
const sendEmail = require('../controllers/email-controller')

const signUp = asyncHandler(async(req, res) => {
    const { email, password, role, name, phone } = req.body
    if (!email || !password || !role || !name || !phone) {
        res.status(500).json({ msg: "Field cannot be empty" })
    }
    //now check if a user with that email exist
    const userExist = await User.findOne({ email })
    if (userExist) {
        res.status(500).json({ msg: "User with email already exist" })
    } else {
        //save the new user into the db
        const newUser = await User.create(req.body)
            //save to auth collection
        const newAuth = await Auth.create({
            userId: newUser._id,
            password: password
        })
        if (!newUser || !newAuth) {
            res.status(500).json({ msg: "User created unsuccessfully" })
        }
        res.status(200).json({ msg: "User created successfully", userInfo: newUser, token: generateToken(newUser._id, newUser.name, newUser.email, newUser.role) })
        sendEmail(`Account Creation`, `Welcome ${name} account created successfully`, email)
    }
})

const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(500).json({ msg: "Field cannot be empty" })
    }
    const findUser = await User.findOne({ email })
    if (!findUser) {
        res.status(500).json({ msg: `User with ${email} not found` })
    }
    const userId = findUser._id
    const findAuth = await Auth.findOne({ userId })
    if (findAuth && (await findAuth.matchPassword(password))) {
        res.status(200).json({ userInfo: findUser, token: generateToken(findUser._id, findUser.name, findUser.email, findUser.role) })
    } else {
        res.status(500).json({ msg: "Incorrect password, check password and try again later" })
    }
})

const recoverPassword = asyncHandler(async(req, res) => {
    const { email, password } = req.body
        //hash the entered password
    const findUser = await User.findOne({ email })
    const userId = findUser._id
    if (findUser) {
        const salt = await bcrypt.genSalt(10)
        const newPassword = await bcrypt.hash(password, salt)
        const findAuth = await Auth.findOneAndUpdate({ userId }, { password: newPassword }, { new: true, runValidator: true })
        if (!findAuth) {
            res.status(500).json({ msg: "Password not changed successfully" })
        }
        res.status(500).json({ msg: "Password updated successfully", userInfo: findAuth })
        sendEmail("Password Recovery", "Password recovered successfully", email)
    } else {
        res.status(500).json({ msg: `User info with email ${email} not found` })
    }

})

module.exports = { signUp, login, recoverPassword }