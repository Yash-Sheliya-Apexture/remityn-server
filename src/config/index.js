// import dotenv from 'dotenv';
// dotenv.config(); // Load environment variables from .env file

// import databaseConfig from './database.config.js';
// import authConfig from './auth.config.js';

// export default {
//     database: databaseConfig,
//     auth: authConfig,
//     port: process.env.PORT || 5000, // Default port if not in .env
// };


// import dotenv from 'dotenv';
// dotenv.config();

// import databaseConfig from './database.config.js';
// import authConfig from './auth.config.js';

// const emailConfig = {
//     smtpHost: process.env.SMTP_HOST,
//     smtpPort: process.env.SMTP_PORT,
//     smtpUser: process.env.SMTP_USER,
//     smtpPass: process.env.SMTP_PASS,
//     emailUser: process.env.EMAIL_USER, // Your email address for "From" field
//     adminEmail: process.env.ADMIN_EMAIL, // Admin email for notifications (optional)
//     clientURL: process.env.CLIENT_URL || 'http://localhost:3000', // Frontend URL
// };

// const  cloudinaryConfig= {
//     cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//     apiKey: process.env.CLOUDINARY_API_KEY,
//     apiSecret: process.env.CLOUDINARY_API_SECRET,
//     uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'wise_clone_kyc', // Optional: specific folder
// };
// export default {
//     database: databaseConfig,
//     auth: authConfig,
//     port: process.env.PORT || 5000,
//     email: emailConfig, // Add email config
//     cloudinary:cloudinaryConfig,
// };


// config/index.js
import dotenv from 'dotenv';
dotenv.config();

import databaseConfig from './database.config.js';
import authConfig from './auth.config.js';

const emailConfig = {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    emailUser: process.env.EMAIL_USER,
    adminEmail: process.env.ADMIN_EMAIL,
    clientURL: process.env.CLIENT_URL || 'http://localhost:3000',
    emailFromName: process.env.EMAIL_FROM_NAME || 'Wise Clone', // Added default name
};

const  cloudinaryConfig= {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'wise_clone_kyc', // Optional: specific folder
};
// --- Add Google Auth Config ---
const googleAuthConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
};
// -----------------------------

export default {
    database: databaseConfig,
    auth: authConfig,
    port: process.env.PORT || 5000,
    email: emailConfig,
    cloudinary:cloudinaryConfig, // Make sure this is correctly defined/imported
    googleAuth: googleAuthConfig, // <-- Add Google config
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000', // Add clientUrl directly for easier access
};