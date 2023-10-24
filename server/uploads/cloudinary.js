// const cloudinary = require('cloudinary').v2;
// // const cloudinary = (imagePath) => {
// // Require the cloudinary library

// // Return "https" URLs by setting secure: true
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     secure: true
// });
// // Log the configuration
// console.log(cloudinary.config());

// // Uploads an image file
// const uploadImage = async(imagePath) => {
//     // Use the uploaded file's name as the asset's public ID and 
//     // allow overwriting the asset with new versions
//     const options = {
//         use_filename: true,
//         unique_filename: false,
//         overwrite: true,
//     };
//     try {
//         // Upload the image
//         const result = await cloudinary.uploader.upload(imagePath, options);
//         console.log(result);
//         return result.public_id;
//     } catch (error) {
//         console.error('error here', error);
//     }
// };
// // uploadImage(imagePath)
// // }

// // module.exports = uploadImage