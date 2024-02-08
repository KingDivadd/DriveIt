const asyncHandler = require('express-async-handler')
const User = require('../model/user-model')
const Auth = require("../model/auth-model")
const bcrypt = require('bcrypt')
const generateToken = require('../config/generateToken')
const sendEmail = require('../controllers/email-controller')
const { StatusCodes } = require('http-status-codes')

// code generation
function uniqueCode() {
    const characters = '0123456789';
    let randomString = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

const signUp = asyncHandler(async(req, res) => {
    const { firstName, lastName, email, password, staffId, phone, role, dept, pic } = req.body
    if (!firstName || !lastName || !email || !password || !phone || !role) {
        res.status(500).json({ err: "Field cannot be empty" })
    }
    //now check if a user with that email exist
    const userExist = await User.findOne({
        $or: [
            { email: { $regex: new RegExp(email, 'i') } },
            { staffId: { $regex: new RegExp(staffId, 'i') } }
        ]
    })
    if (userExist) {
        return res.status(StatusCodes.BAD_REQUEST).json({ err: "Error... Email / Staff-Id already registered to another user!!!" })
    }
    //save the new user into the db
    const newUser = await User.create(req.body)
        //save to auth collection
    const newAuth = await Auth.create({
        userId: newUser._id,
        password: password,
        uniqueCode: uniqueCode()

    })
    if (!newUser || !newAuth) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "User creation failed!!!" })
    }
    res.status(200).json({ msg: "User created successfully", userInfo: newUser, token: generateToken({ id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, role: newUser.role, pic: newUser.pic }) })
    sendEmail("Account Createion", { firstName: newUser.firstName, info: "Welcome to FUTA OptiDrive. A platform for managing futa's official fleet of vehicles...", code: '' }, email)
})

const signIn = asyncHandler(async(req, res) => {
        const { email_staffId, password } = req.body

        if (!email_staffId || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ err: "Error... Please provide your email / staffId and password!!!" })
        }

        const findUser = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(email_staffId.trim(), 'i') } },
                { staffId: { $regex: new RegExp(email_staffId.trim(), 'i') } }
            ]
        })
        if (!findUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ err: `User with email / staffId '${email_staffId}' not found!!!` })

        }
        const userId = findUser._id
        const findAuth = await Auth.findOne({ userId })
        if (findAuth && (await findAuth.matchPassword(password))) {
            res.status(200).json({ userInfo: findUser, token: generateToken({ id: findUser._id, firstName: findUser.firstName, lastName: findUser.lastName, role: findUser.role, pic: findUser.pic }) })
        } else {
            res.status(401).json({ err: "Incorrect password, check password and try again!!!" })
        }
    })
    // reveryCode

const recoveryCode = asyncHandler(async(req, res) => {
    const { email } = req.body
        // first check if the email exist
    const verifyEmail = await User.findOne({ email })
    if (!verifyEmail) {
        return res.status(400).json({ err: `${email} is not a registered email, check email and try again!!!` })
    }
    // generatiing a new code for users
    let genCode = uniqueCode()
    const userAuth = await Auth.findOneAndUpdate({ userId: verifyEmail._id }, { uniqueCode: genCode }, { new: true, runValidators: true }).select('userId uniqueCode')
    sendEmail("DrivIt-confirmation", { firstName: verifyEmail.firstName, info: "Here's your password recovery code", code: genCode }, email)
    res.status(200).json({ msg: 'Recovery code generated and sent successfully...', info: userAuth })



})

const recoveryCodeVerify = asyncHandler(async(req, res) => {
    const { email, code } = req.body

    const verifyEmail = await User.findOne({ email })
    if (!verifyEmail) {
        return res.status(400).json({ err: `${email} is not a registered email, check email and try again!!!` })
    }
    let id = verifyEmail._id
    const userAuth = await Auth.findOne({ userId: id })
    if (code === userAuth.uniqueCode) {
        res.status(200).json({ msg: 'Correct code provided' })
    } else {
        res.status(400).json({ err: 'Incorrect recovery code provided!!!' })
    }

})

// this will work with sending email to the registered email for authentication...
const recoverPassword = asyncHandler(async(req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(500).json({ err: `Error... Field cannot be empty!!!` })
    }
    //hash the entered password
    const findUser = await User.findOne({ email })
    if (!findUser) {
        return res.status(StatusCodes.NOT_FOUND).json({ err: `Error... User with email '${email}' not found!!!` })
    }
    const userId = findUser._id

    const salt = await bcrypt.genSalt(10)
    const newPassword = await bcrypt.hash(password, salt)
    const findAuth = await Auth.findOneAndUpdate({ userId }, { password: newPassword }, { new: true, runValidator: true }).select("userId uniqueCode")
    if (!findAuth) {
        res.status(500).json({ err: "Error... Password update failed!!!" })
    }
    res.status(200).json({ msg: "Password updated successfully", userInfo: findAuth })
    sendEmail("Password Recovery", { firstName: findUser.firstName, info: "Password updated successfully", code: '' }, email)


})

module.exports = { signUp, signIn, recoverPassword, recoveryCode, recoveryCodeVerify }