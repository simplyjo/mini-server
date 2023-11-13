const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploads = async (file, folder) => {
    try {
        const result = await cloudinary.uploader.upload(file,  {
          folder: "Logo",
        });
        return result
        console.log(result)
    } catch (error) {
        
    }

};


