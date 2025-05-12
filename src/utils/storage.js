// // backend/src/utils/storage.js
// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from '../config/cloudinary.js';
// import config from '../config/index.js';
// import path from 'path';

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         // Determine folder and filename
//         const userId = req.user?._id || 'unknown_user'; // Assuming req.user is populated by authMiddleware
//         const timestamp = Date.now();
//         const originalNameWithoutExt = path.parse(file.originalname).name;
//         const fileExtension = path.parse(file.originalname).ext;

//         // Example: users/user_id/kyc/id_front_timestamp.jpg
//         const filename = `${file.fieldname}_${timestamp}${fileExtension}`; // Use fieldname (e.g., id_front, id_back)

//         return {
//             folder: `${config.cloudinary.uploadFolder}/users/${userId}/kyc`,
//             public_id: filename, // Use the filename as public_id for easier association
//             // transformation: [{ width: 1000, height: 1000, crop: "limit" }] // Optional: resize images
//         };
//     },
// });

// const fileFilter = (req, file, cb) => {
//     // Accept only common image types
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
//         cb(null, true);
//     } else {
//         cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5 // 5MB limit per file
//     },
//     fileFilter: fileFilter
// });

// // Middleware specifically for KYC docs (expecting 'id_front' and 'id_back' fields)
// const uploadKycDocuments = upload.fields([
//     { name: 'id_front', maxCount: 1 },
//     { name: 'id_back', maxCount: 1 }
// ]);

// export { uploadKycDocuments }; // Export the specific middleware


// // backend/utils/storage.js
// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinaryV2 from '../config/cloudinary.js';
// import AppError from './AppError.js';

// // --- Cloudinary Storage Engine ---
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinaryV2,
//     params: async (req, file) => {
//         console.log(`[CloudinaryStorage PARAMS] START - Field: ${file.fieldname}, Filename: ${file.originalname}`);
//         try {
//             const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'];
//             const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

//             if (!fileExtension || !allowedFormats.includes(fileExtension)) {
//                  console.warn(`[CloudinaryStorage PARAMS] File format check failed for: ${file.originalname} (ext: ${fileExtension})`);
//                  // Throw an error here to stop the upload if format is invalid at this stage
//                  throw new AppError(`Invalid file format: .${fileExtension}. Only JPG, PNG, PDF allowed.`, 400);
//             }

//             let folderPath = `kyc_documents/misc/${file.fieldname}`;
//              // Ensure req.user exists before accessing _id
//             if (req.user?._id) {
//                 if (file.fieldname === 'id_front' || file.fieldname === 'id_back') {
//                     folderPath = `kyc_documents/${req.user._id}/${file.fieldname}`;
//                 } else {
//                     console.warn(`[CloudinaryStorage PARAMS] User authenticated but unexpected fieldname '${file.fieldname}'. Using default folder.`);
//                 }
//             } else {
//                  console.warn(`[CloudinaryStorage PARAMS] User ID missing from req.user during params generation. Uploading to misc folder.`);
//                  // If user MUST be authenticated, throw error
//                   throw new AppError("User authentication required to determine upload path.", 401);
//             }

//             console.log(`[CloudinaryStorage PARAMS] Determined folder: ${folderPath}`);

//             const params = {
//                 folder: folderPath,
//                 resource_type: 'auto',
//                 // Optional: Add a timestamp or unique identifier to the public_id to prevent overwrites
//                 // public_id: `user_${req.user._id}_${file.fieldname}_${Date.now()}`,
//             };
//             console.log('[CloudinaryStorage PARAMS] SUCCESS - Returning params:', params);
//             return params;

//         } catch (error) {
//             console.error('[CloudinaryStorage PARAMS] CRITICAL ERROR generating params:', error);
//             // Ensure AppError is thrown so middleware can catch statusCode
//             if (error instanceof AppError) {
//                  throw error;
//             } else {
//                  throw new AppError(`Failed to determine upload parameters: ${error.message}`, 500);
//             }
//         }
//     },
// });

// // --- File Filter ---
// const fileFilter = (req, file, cb) => {
//     console.log(`[FileFilter] Checking - Field: ${file.fieldname}, Filename: ${file.originalname}, Mimetype: ${file.mimetype}`);
//     const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

//     if (!allowedMimeTypes.includes(file.mimetype)) {
//         console.error(`[FileFilter] Rejected: Invalid mime type: ${file.mimetype} for file ${file.originalname}`);
//         // Pass an AppError to the callback
//         return cb(new AppError(`Invalid file type: ${file.mimetype}. Only JPG, PNG, PDF allowed.`, 400), false);
//     }

//     console.log(`[FileFilter] Accepted: ${file.originalname}`);
//     cb(null, true); // Accept the file
// };

// // --- Multer Configuration ---
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB
//     },
// });

// // --- Export Specific Middleware for KYC Routes ---
// export const uploadKycDocuments = (req, res, next) => {
//     console.log('[uploadKycDocuments Middleware] === Initiating File Processing ===');
//     // Log Content-Type immediately to diagnose the root cause
//     const contentType = req.headers['content-type'];
//     console.log('[uploadKycDocuments Middleware] Request Content-Type:', contentType);

//     // *** CRITICAL CHECK: If Content-Type is not multipart/form-data, bypass Multer ***
//     if (!contentType || !contentType.startsWith('multipart/form-data')) {
//         console.warn('[uploadKycDocuments Middleware] SKIPPING MULTER: Content-Type is NOT multipart/form-data. Proceeding to next middleware.');
//         // If this happens, req.files will be undefined, and req.body might be parsed by express.json if applicable
//         return next(); // Go directly to the controller (which will likely fail file validation)
//     }

//     // Content-Type IS multipart/form-data, proceed with Multer
//     console.log('[uploadKycDocuments Middleware] Content-Type is multipart/form-data. Proceeding with Multer.');
//     const uploader = upload.fields([
//         { name: 'id_front', maxCount: 1 },
//         { name: 'id_back', maxCount: 1 }
//     ]);

//     console.log('[uploadKycDocuments Middleware] Calling Multer uploader function...');
//     uploader(req, res, (err) => {
//         console.log('[uploadKycDocuments Middleware] >>> Multer uploader CALLBACK Entered <<<');

//         if (err) {
//             console.error('[uploadKycDocuments Middleware] >>> Multer CALLBACK ERROR <<<', err);
//             if (err instanceof multer.MulterError) {
//                  console.error(`[uploadKycDocuments Middleware] MulterError Code: ${err.code}, Field: ${err.field}`);
//                  // Respond directly for Multer errors (like file size limit)
//                  return res.status(400).json({ message: `File upload error: ${err.message} (Field: ${err.field || 'unknown'})` });
//             }
//             else if (err instanceof AppError) {
//                  console.error(`[uploadKycDocuments Middleware] AppError from filter/params: ${err.message}, Status: ${err.statusCode}`);
//                  // Respond with the status code from the AppError
//                  return res.status(err.statusCode || 400).json({ message: err.message });
//             }
//             else {
//                  console.error('[uploadKycDocuments Middleware] Unexpected error during Multer processing:', err);
//                  // Pass other errors to the global handler
//                  return next(err);
//             }
//         } else {
//             // Multer finished without error
//             console.log('[uploadKycDocuments Middleware] >>> Multer CALLBACK SUCCESS (No error passed) <<<');
//             console.log('[uploadKycDocuments Middleware] req.files AFTER Multer:', JSON.stringify(req.files, null, 2));
//             console.log('[uploadKycDocuments Middleware] req.body AFTER Multer:', JSON.stringify(req.body, null, 2));

//             // Check if files are populated - this is informational now, controller does validation
//             if (typeof req.files === 'undefined' || Object.keys(req.files).length === 0) {
//                  console.warn('[uploadKycDocuments Middleware] WARNING: Multer callback success, but req.files is empty or undefined. Controller will perform final validation.');
//             }

//             console.log('[uploadKycDocuments Middleware] Calling next() to proceed to controller...');
//             next(); // Proceed to the controller
//         }
//         console.log('[uploadKycDocuments Middleware] <<< Exiting Multer uploader CALLBACK >>>');
//     });
//      console.log('[uploadKycDocuments Middleware] === Exiting Outer Middleware Function (Multer process continues async) ===');
// };


// backend/utils/storage.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryV2 from '../config/cloudinary.js';
import AppError from './AppError.js';

// --- Cloudinary Storage Engine ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryV2,
    params: async (req, file) => {
        console.log(`[CloudinaryStorage PARAMS] START - Field: ${file.fieldname}, Original Filename: ${file.originalname}`); // Log original name
        try {
            // File format check based on original name (basic)
            const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'];
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
            if (!fileExtension || !allowedFormats.includes(fileExtension)) {
                 console.warn(`[CloudinaryStorage PARAMS] File format check failed for: ${file.originalname} (ext: ${fileExtension})`);
                 throw new AppError(`Invalid file format: .${fileExtension}. Only JPG, PNG, PDF allowed.`, 400);
            }

            // Determine folder path based on authenticated user
            let folderPath = `kyc_documents/unknown_user/${file.fieldname}`; // Default safer path
            if (!req.user || !req.user._id) {
                 console.error(`[CloudinaryStorage PARAMS] CRITICAL: User ID missing from req.user. Cannot determine secure upload path.`);
                 // Decide whether to allow upload to generic folder or fail
                  throw new AppError("User authentication required to determine upload path.", 401); // Fail if user must be known
                 // If allowing upload, maybe use a temporary ID? Be cautious.
            } else {
                 // Use user ID in the path for organization
                 folderPath = `kyc_documents/${req.user._id}/${file.fieldname}`;
                 console.log(`[CloudinaryStorage PARAMS] User authenticated (${req.user._id}). Path: ${folderPath}`);
            }

            // Cloudinary parameters
            const params = {
                folder: folderPath,
                resource_type: 'auto', // Let Cloudinary detect resource type
                // Optional: Add timestamp or unique ID to public_id to prevent collisions if needed
                // public_id: `user_${req.user._id}_${file.fieldname}_${Date.now()}`,
                // Optional: Add tags for easier management in Cloudinary
                // tags: ['kyc', `user-${req.user._id}`, file.fieldname]
            };
            console.log('[CloudinaryStorage PARAMS] SUCCESS - Returning params:', params);
            return params;

        } catch (error) {
            console.error('[CloudinaryStorage PARAMS] CRITICAL ERROR generating params:', error);
            // Ensure AppError is thrown for middleware to catch status code
            if (error instanceof AppError) throw error;
            throw new AppError(`Failed to determine upload parameters: ${error.message}`, 500);
        }
    },
});

// --- File Filter (Using Mime Types - More Reliable) ---
const fileFilter = (req, file, cb) => {
    console.log(`[FileFilter] Checking - Field: ${file.fieldname}, Filename: ${file.originalname}, Mimetype: ${file.mimetype}`);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        console.error(`[FileFilter] Rejected: Invalid mime type: ${file.mimetype} for file ${file.originalname}`);
        // Pass an AppError to the callback for better handling in the middleware
        return cb(new AppError(`Invalid file type: ${file.mimetype}. Only JPG, PNG, PDF allowed.`, 400), false);
    }

    console.log(`[FileFilter] Accepted: ${file.originalname}`);
    cb(null, true); // Accept the file
};

// --- Multer Configuration ---
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// --- Export Specific Middleware for KYC Routes ---
export const uploadKycDocuments = (req, res, next) => {
    console.log('[uploadKycDocuments Middleware] === Initiating File Processing ===');
    const contentType = req.headers['content-type'];
    console.log('[uploadKycDocuments Middleware] Request Content-Type:', contentType);

    // *** CRITICAL CHECK: Ensure Content-Type is multipart/form-data ***
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
        console.error('[uploadKycDocuments Middleware] ERROR: Content-Type is NOT multipart/form-data. Multer cannot process this request.');
        // Send a 400 Bad Request error immediately
        return res.status(400).json({ message: 'Invalid request format: Content-Type must be multipart/form-data for file uploads.' });
    }

    // Define the fields expected by Multer
    const uploader = upload.fields([
        { name: 'id_front', maxCount: 1 },
        { name: 'id_back', maxCount: 1 } // Even if optional, define it
    ]);

    console.log('[uploadKycDocuments Middleware] Calling Multer uploader function...');
    uploader(req, res, (err) => {
        console.log('[uploadKycDocuments Middleware] >>> Multer uploader CALLBACK Entered <<<');

        if (err) {
            console.error('[uploadKycDocuments Middleware] >>> Multer CALLBACK ERROR <<<', err);
            if (err instanceof multer.MulterError) {
                 // Handle specific Multer errors (e.g., file size limit)
                 console.error(`[uploadKycDocuments Middleware] MulterError Code: ${err.code}, Field: ${err.field}`);
                 let message = `File upload error: ${err.message}`;
                 if (err.code === 'LIMIT_FILE_SIZE') message = `File too large. Maximum size is ${upload.limits.fileSize / 1024 / 1024}MB.`;
                 if (err.field) message += ` (Field: ${err.field})`;
                 return res.status(400).json({ message });
            }
            else if (err instanceof AppError) {
                 // Handle errors from fileFilter or CloudinaryStorage params
                 console.error(`[uploadKycDocuments Middleware] AppError from filter/params: ${err.message}, Status: ${err.statusCode}`);
                 return res.status(err.statusCode || 400).json({ message: err.message });
            }
            else {
                 // Handle other unexpected errors during Multer processing
                 console.error('[uploadKycDocuments Middleware] Unexpected error during Multer processing:', err);
                 return next(new AppError('An unexpected error occurred during file upload.', 500)); // Pass a generic AppError
            }
        } else {
            // Multer finished without *its own* errors
            console.log('[uploadKycDocuments Middleware] >>> Multer CALLBACK SUCCESS (No error passed from Multer) <<<');
            console.log('[uploadKycDocuments Middleware] req.files AFTER Multer:', JSON.stringify(req.files, null, 2));
            console.log('[uploadKycDocuments Middleware] req.body AFTER Multer:', JSON.stringify(req.body, null, 2)); // Body fields parsed by Multer

            // It's possible Multer succeeded but no files were actually uploaded matching the fields
            // The controller will perform the final validation for required files.
            if (typeof req.files === 'undefined' || Object.keys(req.files).length === 0) {
                 console.warn('[uploadKycDocuments Middleware] WARNING: Multer callback success, but req.files is empty or undefined. Ensure files were sent with correct field names.');
            }

            console.log('[uploadKycDocuments Middleware] Calling next() to proceed to controller...');
            next(); // Proceed to the kycController.submitKyc
        }
        console.log('[uploadKycDocuments Middleware] <<< Exiting Multer uploader CALLBACK >>>');
    });
     console.log('[uploadKycDocuments Middleware] === Exiting Outer Middleware Function (Multer process continues async) ===');
};