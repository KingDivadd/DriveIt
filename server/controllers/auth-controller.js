const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Auth = require("../model/auth-model")
const bcrypt = require('bcrypt')
const generateToken = require('../config/generateToken')
const sendEmail = require('../controllers/email-controller')
const { StatusCodes } = require('http-status-codes')

// code generation
function uniqueCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

const signUp = asyncHandler(async(req, res) => {
    const { email, password, role, name, phone } = req.body
    if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({ err: "Field cannot be empty" })
    }
    //now check if a user with that email exist
    const userExist = await User.findOne({ email })
    if (userExist) {
        res.status(StatusCodes.BAD_REQUEST).json({ err: "User with email already exist" })
    } else {
        //save the new user into the db
        const newUser = await User.create(req.body)
            //save to auth collection
        const newAuth = await Auth.create({
            userId: newUser._id,
            password: password,
            uniqueCode: uniqueCode()

        })
        if (!newUser || !newAuth) {
            res.status(StatusCodes.BAD_REQUEST).json({ msg: "User creation failed!!!" })
        }
        res.status(200).json({ msg: "User created successfully", userInfo: newUser, token: generateToken(newUser._id, newUser.name, newUser.email, newUser.role) })
        sendEmail(`Account Creation`, `Welcome ${name} account created successfully`, email)
    }
})

const login = asyncHandler(async(req, res) => {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ msg: "Field cannot be empty" })
        }
        const findUser = await User.findOne({ email }).populate("vehicle")
        if (!findUser) {
            res.status(StatusCodes.NOT_FOUND).json({ msg: `User with ${email} not found` })
        }
        const userId = findUser._id
        const findAuth = await Auth.findOne({ userId })
        if (findAuth && (await findAuth.matchPassword(password))) {
            res.status(200).json({ userInfo: findUser, token: generateToken({ id: findUser._id, name: findUser.name, email: findUser.email, role: findUser.role, pic: findUser.pic }) })
        } else {
            res.status(500).json({ msg: "Incorrect password, check password and try again later" })
        }
    })
    // reveryCode

const recoveryCode = asyncHandler(async(req, res) => {
    const { email } = req.body
        // first check if the email exist
    const verifyEmail = await User.findOne({ email })
    if (!verifyEmail) {
        res.status(400).json({ msg: `${email} is not a registered email, check email and try again...` })
    }
    // generatiing a new code for users
    let genCode = uniqueCode()
    const userAuth = await Auth.findOneAndUpdate({ userId: verifyEmail._id }, { uniqueCode: genCode }, { new: true, runValidators: true }).select('userId uniqueCode')
    sendEmail("DrivIt-confirmation", `Hi ${verifyEmail.name}, Here's your password recovery code ${genCode}`, email)
    res.status(200).json({ msg: 'Recovery code generated and sent successfylly...', info: userAuth })

})

const recoveryCodeVerify = asyncHandler(async(req, res) => {
    const { email, code } = req.body

    const verifyEmail = await User.findOne({ email })
    if (!verifyEmail) {
        res.status(400).json({ msg: `${email} is not a registered email, check email and try again...` })
    }
    let id = verifyEmail._id
    const userAuth = await Auth.findOne({ userId: id })
    if (code === userAuth.uniqueCode) {
        res.status(200).json({ msg: 'Correct code provided' })
    } else {
        res.status(400).json({ err: 'Incorrect recovery code provided' })
    }

})

// this will work with sending email to the registered email for authentication...
const recoverPassword = asyncHandler(async(req, res) => {
    const { email, password } = req.body
        //hash the entered password
    const findUser = await User.findOne({ email })
    const userId = findUser._id
    if (findUser) {
        const salt = await bcrypt.genSalt(10)
        const newPassword = await bcrypt.hash(password, salt)
        const findAuth = await Auth.findOneAndUpdate({ userId }, { password: newPassword }, { new: true, runValidator: true }).select("userId uniqueCode")
        if (!findAuth) {
            res.status(500).json({ msg: "Password not changed successfully" })
        }
        res.status(200).json({ msg: "Password updated successfully", userInfo: findAuth })
        sendEmail("Password Recovery", "Password recovered successfully", email)
    } else {
        res.status(500).json({ msg: `User info with email ${email} not found` })
    }

})

module.exports = { signUp, login, recoverPassword, recoveryCode, recoveryCodeVerify }