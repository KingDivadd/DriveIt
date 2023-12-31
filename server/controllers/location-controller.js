const asyncHandler = require('express-async-handler')
const Location = require("../model/location-model")
const mongoose = require('mongoose')

const beginTracking = asyncHandler(async(req, res) => {


        // // fetchAndStoreData.js
        // const axios = require('axios');
        // const mongoose = require('mongoose');
        // const Location = require('./models/Location');

        // // async function fetchDataAndStore() {
        // try {
        //     // Replace 'YOUR_GOOGLE_MAPS_API_KEY' and 'YOUR_ENDPOINT' with actual values
        //     const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
        //     const endpoint = 'YOUR_ENDPOINT';

        //     const response = await axios.get(endpoint, {
        //         params: {
        //             key: apiKey,
        //             // Add any additional parameters needed for your Google Maps API request
        //         },
        //     });

        //     const { latitude, longitude } = response.data; // Extract relevant data from the API response

        //     await Location.create({ latitude, longitude })
        //     console.log('Data stored successfully.');
        // } catch (error) {
        //     console.error('Error fetching or storing data:', error.message);
        // }


    })
    // setInterval(beginTracking, 0.5 * 60 * 1000); // Rerun the command in 2.5 minues and fetch and store the data

module.exports = { beginTracking }