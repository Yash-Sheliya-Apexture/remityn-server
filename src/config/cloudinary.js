// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import config from './index.js'; // Your main config file

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true, // Use https
});

console.log("Cloudinary configured for cloud:", config.cloudinary.cloudName);

export default cloudinary; // Export the configured v2 instance