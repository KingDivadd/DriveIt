const cloudinary = require('cloudinary').v2;
const express = require('express');
const multer = require('multer');
require('dotenv').config()
const User = require('../model/user-model')

// Configure Cloudinary with your API credentials
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_secret: process.env.API_SECRET,
    api_key: process.env.API_KEY,
});

const app = express();

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');



// Define a route for handling file uploads
const uploadImage = (req, res, next) => {
    upload(req, res, (error) => {
        if (error) {
            return res.status(400).send('Error uploading the file: ' + error.message);
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }


        if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
            // Upload the image to Cloudinary
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                if (error) {
                    return res.status(500).send('Error uploading to Cloudinary: ' + error.message);
                }
                // now add the url to the user's schema
                updatePic(url = result.secure_url, req, res)
                    // Return the Cloudinary URL of the uploaded image
                    // res.json({ url: result.secure_url });
                    // I want to then add this pic to the respect user's db
            }).end(req.file.buffer);
        } else {
            return res.status(400).send("File format not supported")
        }
    })
}

const updatePic = async(url, req, res) => {
    const newPic = await User.findOneAndUpdate({ _id: req.info.id }, { pic: url }, { new: true, runValidator: true })
    if (!newPic) {
        res.status(500).json({ msg: "Change of name was unsuccessful." })
    }
    res.status(200).json({ msg: "Image changed successfully", user: newPic })


}

const deleteImage = async(req, res) => {
    // first we get the url of the image to be deleted.
    console.log(req.info.email, 'role', req.info.role)
        // const cloudinaryURL = req.info.pic;

    // // Split the URL by '/' and select the segment that represents the public ID
    // const segments = cloudinaryURL.split('/');
    // const publicId = segments[segments.length - 1].split('.')[0];

    // console.log(publicId); // This will print "1698311001"

    // const { id: imageId } = req.params
    // imageId = publicId

    // res.send("public id ", imageId)
}
module.exports = { uploadImage, deleteImage }