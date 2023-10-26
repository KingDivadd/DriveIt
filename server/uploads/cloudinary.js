const cloudinary = require('cloudinary').v2;
const express = require('express');
const multer = require('multer');
require('dotenv').config()

// Configure Cloudinary with your API credentials
cloudinary.config({
    cloud_name: "ddlitun0t",
    api_secret: "L54LzHinn1lfSsa1Ivj8bybpnFs",
    api_key: "724181796191326",
});

const app = express();

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a route for handling file uploads
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {


        // Upload the image to Cloudinary
        cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) {
                return res.status(500).send('Error uploading to Cloudinary: ' + error.message);
            }

            // Return the Cloudinary URL of the uploaded image
            res.json({ url: result.secure_url });
        }).end(req.file.buffer);
    } else {
        return res.status(400).send("File format not supported")
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});