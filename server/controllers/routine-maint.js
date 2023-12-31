const asyncHandler = require('express-async-handler')
const Vehicle = require('../model/vehicle-model')
const DailyLog = require("../model/daily-log-model")
const Notification = require("../model/notification-model")

// It should be noted that the entirety of the operations here are more or less planned maintenance, It doesn't account for breakdown or predictive maintenance. For those we'll have to write additional scripts

// for engine oil change
const engineOilChange = asyncHandler(async(req, res) => {
    // for this I have to fetch all the vehicles, check their mileage and compare it to the expected range to determine whethe it is due for service.
    const allVehicles = await Vehicle.find({})
    allVehicles.forEach(async(data, ind) => {
        const dailyLogBox = []
        const dailyLogs = data.daily_log
        dailyLogs.forEach(async(res, index) => {
            const fetchDailyMileage = await DailyLog.findOne({ _id: res[index] }).select("dailyMileage")
            dailyLogBox.push(Number(fetchDailyMileage.replace(/,/g, '')))
        });
        const avgDailyMileage = Math.round(dailyLogBox.reduce((a, b) => a + b))
        const current_mileage = Number(data.current_mileage.replace(/,/g, ''))
        const service_mileage = Number(data.service_mileage.replace(/,/g, ''))

        if (service_mileage > current_mileage) {
            const diff = service_mileage - current_mileage
            const remDays = Math.round(diff / avgDailyMileage)
            if (remDays <= 10) {
                console.log(`Note... Engine oil change is due in ${remDays} days`)
                await Notification.create({ title: `Engine oil change`, message: `Engine oil change is due in ${remDays} days`, vehicleInfo: data._id, access: 'vehicle_asignee' })

                await Notification.create({ title: `Engine oil change`, message: `Engine oil change is due in ${remDays} days. Click here to know more about this vehicle.`, vehicleInfo: data._id, access: 'maintenance_personnel' })
            }
        }
        if (service_mileage === current_mileage) {
            console.log(`Note... Engine oil change is due today!!!`)
            await Notification.create({ title: `Engine oil change`, message: `Engine oil change is due!!!`, vehicleInfo: data._id, access: 'vehicle_asignee' })

            await Notification.create({ title: `Engine oil change`, message: `Engine oil change is due today. Click here to know more about this vehicle.`, vehicleInfo: data._id, access: 'maintenance_personnel' })
        }
        if (service_mileage < current_mileage) {
            const diff = current_mileage - service_mileage
            const overDays = Math.round(diff / avgDailyMileage)
            console.log(`Note... Engine oil change is ${overDays} days past due date.`)
            await Notification.create({ title: `Engine oil change`, message: `Engine oil change is ${overDays} days past recommended due date!!!`, vehicleInfo: data._id, access: 'vehicle_asignee' })

            await Notification.create({ title: `Engine oil change`, message: `Engine oil change for this vehicle is ${overDays} days past the recommended due date. Click here to know more about the vehicle.`, vehicleInfo: data._id, access: 'maintenance_personnel' })
        }

    });

})

setInterval(() => {
    engineOilChange
}, 24 * 3600 * 1000);

const genVehicleService = asyncHandler(async(req, res) => {
    const allVehicles = await Vehicle.find({})
    allVehicles.foreach(async(data, ind) => {
        const dailyLogBox = []
        const dailyLogs = data.daily_log
        dailyLogs.forEach(async(res, index) => {
            const fetchDailyMileage = await DailyLog.findOne({ _id: res[index] }).select("dailyMileage")
            dailyLogBox.push(Number(fetchDailyMileage.replace(/,/g, '')))
        });
        const avgDailyMileage = Math.round(dailyLogBox.reduce((a, b) => a + b))
        const current_mileage = Number(data.current_mileage.replace(/,/g, ''))
        const service_mileage = Number(data.service_mileage.replace(/,/g, ''))

        if (service_mileage > current_mileage) {
            const diff = service_mileage - current_mileage
            const remDays = Math.round(diff / avgDailyMileage)
            if (remDays <= 10) {
                // notify to prepare for the gen service
            }
        }
        if (service_mileage === current_mileage) {
            // also remind user that vehicle is due for service
        }
        if (service_mileage < current_mileage) {
            // remind user that vehicle is past recommended service due date
        }
    })
})

setInterval(() => {
    genVehicleService
}, 24 * 3600 * 1000);

// every 25k - 70k miles
const routineBrakeInspection = asyncHandler(async(req, res) => {

})
module.exports = { engineOilChange, genVehicleService, routineBrakeInspection, }

//oil change 5 - 10k = 7.5
//Tire rotation = 6k - 8k = 7
//Brake = 25k - 70k = 47.5
//transmission fluid change = 30k - 60k = 45
//air filter check = 12k - 15k = 13.5
//coolant system = 40k - 100k = 70
//spark plugs = 30k - 100k = 65

// suspension system is predictive in that it is only inspected when observed to be faulty