const asyncHandler = require('express-async-handler')
const Vehicle = require('../model/vehicle-model')
const User = require('../model/user-model')
const generateToken = require("../config/generateToken")
const { StatusCodes } = require("http-status-codes")

// createing a vehicle instance
const addVehicle = asyncHandler(async(req, res) => {
    // console.log(req.info.role, req.info.id)
    const { plate_no, engine_no, current_millage, department, vehicle_type, brand } = req.body
    if (req.info.role !== "vehicle_coordinator") {
        res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Error. Not authorized to perform this operation" })
    } else {
        if (!plate_no || !engine_no || !vehicle_type || !brand) {
            res.status(500).json({ msg: "Please enter the vehicle's PLATE NUMBER and ENGINE NUMBER" })
        }
        // check if a vehicle with the entered plate number exist
        const vehicleExist = await Vehicle.findOne({ plate_no })
        if (vehicleExist) {
            res.status(500).json({ msg: `Vehicle with Plate NO. ${plate_no} already exist`.red })
        }
        req.body.added_by = req.info.id
        const newVehicle = await Vehicle.create(req.body)
        res.status(StatusCodes.CREATED).json({ new_Vehicle: newVehicle, token: generateToken(plate_no, engine_no) })
    }
})

//List all vehicles
const getAllVehicles = asyncHandler(async(req, res) => {
    const allVehicles = await Vehicle.find({})
    if (!allVehicles) {
        res.status(500).json({ msg: "Error Fetching all vehicles" })
    }
    res.status(StatusCodes.OK).json({ nbHits: allVehicles.length, allVehicles: allVehicles })
})

// Update vehicle infomation
const updateVehicleInfo = asyncHandler(async(req, res) => {
    const { id: vehicle_id } = req.params
    const { brand, plate_no, vehicle_type, current_millage, engine_no, driver, current_state, department } = req.body

    const update = {}
    if (current_millage.trim() !== '') {
        update.current_millage = current_millage.trim()
    }
    // engine no => can only be edited by maint personnel
    if (req.info.role === 'vehicle_coordinator') {
        if (engine_no.trim() !== '') {
            update.engine_no = engine_no.trim()
        }
        if (driver.trim() !== '') {
            update.driver = driver.trim()
        }
        if (department.trim() !== '') {
            // first we will have to check if the selected department dont already exist
            const dept = department.trim()
            const deptExist = await Vehicle.findOne({ _id: vehicle_id })
            if (dept in deptExist.department === false) {
                update.department = dept
            }
        }
        if (vehicle_type.trim() !== '') {
            update.vehicle_type = vehicle_type.trim()
        }
        if (brand.trim() !== '') {
            update.brand = brand.trim()
        }
        if (plate_no.trim() !== '') {
            update.plate_no = plate_no.trim()
        }
    }
    const allVehicles = await Vehicle.findOne({ _id: vehicle_id })
    if (req.info.id in allVehicles.driver || req.info.role === "vehicle_coordinator") {
        if (current_state && current_state.length > 0) {
            update.current_state = current_state.map(data => data.trim()).filter(data => data !== '')
        }
    }

    const newVehicleInfo = await Vehicle.findOneAndUpdate({ _id: vehicle_id }, { $set: update }, { new: true, runValidators: true })

    res.status(StatusCodes.OK).json({ msg: "Vehicle Info updated successfully", newInfo: newVehicleInfo })
})

module.exports = { addVehicle, updateVehicleInfo, getAllVehicles }