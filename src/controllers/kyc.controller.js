// // backend/src/controllers/kyc.controller.js
// import kycService from '../services/kyc.service.js';
// import mongoose from 'mongoose';

// const submitKyc = async (req, res, next) => {
//     try {
//         const userId = req.user._id; // From authMiddleware
//         const kycData = req.body; // Form data (non-file fields)
//         const files = req.files; // Files from multer (e.g., files.id_front[0], files.id_back[0])

//         // console.log("Received KYC Data:", kycData);
//         // console.log("Received Files:", files);

//         // Basic check if data exists
//         if (!kycData || Object.keys(kycData).length === 0) {
//              return res.status(400).json({ message: 'KYC data is missing.' });
//         }
//          if (!files || ( !files.id_front && !files.id_back)) {
//              // Allow submission without files initially? Decide based on flow.
//              // For final submission, files are likely required.
//              // Let the service handle validation based on idType
//              // console.warn("KYC submission attempt without files.");
//         }


//         // Attempt to parse JSON fields if they were sent as strings (common with FormData)
//         if (kycData.mobile && typeof kycData.mobile === 'string') {
//             try { kycData.mobile = JSON.parse(kycData.mobile); } catch (e) { return res.status(400).json({ message: 'Invalid mobile data format.' }); }
//         }
//         // Parse dates if sent as strings
//         if (kycData.dateOfBirth && typeof kycData.dateOfBirth === 'string') kycData.dateOfBirth = new Date(kycData.dateOfBirth);
//         if (kycData.idIssueDate && typeof kycData.idIssueDate === 'string') kycData.idIssueDate = new Date(kycData.idIssueDate);
//         if (kycData.idExpiryDate && typeof kycData.idExpiryDate === 'string') kycData.idExpiryDate = new Date(kycData.idExpiryDate);

//         const updatedKyc = await kycService.submitKyc(userId, kycData, files);
//         res.status(200).json({ message: 'KYC information submitted successfully. Pending review.', kyc: updatedKyc });

//     } catch (error) {
//         // Handle specific errors from the service
//         if (error.message.includes('Missing required') || error.message.includes('Invalid file type') || error.message.includes('Invalid user ID') || error.message.includes('Invalid mobile data format')) {
//             return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('already verified') || error.message.includes('currently pending')) {
//             return res.status(409).json({ message: error.message }); // Conflict
//         }
//          if (error.message.includes('User not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         next(error); // Pass to generic error handler
//     }
// };

// const skipKyc = async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const result = await kycService.skipKyc(userId);
//         res.status(200).json({ message: 'KYC process skipped for now.', kyc: result });
//     } catch (error) {
//          if (error.message.includes('Cannot skip') || error.message.includes('Invalid user ID')) {
//             return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('User not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// };


// const getMyKycStatus = async (req, res, next) => {
//     try {
//         const userId = req.user._id; // From authMiddleware
//         const kycStatus = await kycService.getKycStatus(userId);
//         res.status(200).json(kycStatus);
//     } catch (error) {
//          if (error.message.includes('Invalid user ID')) {
//             return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('User not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// const updateMyKycDetails = async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const updateData = req.body; // Should contain only { firstName, lastName, mobile, salaryRange }

//         // Basic validation
//         if (!updateData || Object.keys(updateData).length === 0) {
//             return res.status(400).json({ message: 'No update data provided.' });
//         }

//         const updatedKyc = await kycService.updateKycDetails(userId, updateData);
//         res.status(200).json({ message: 'KYC details updated successfully.', kyc: updatedKyc });
//     } catch (error) {
//         if (error.message.includes('Invalid') || error.message.includes('No valid fields')) {
//             return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('User not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// // --- Admin Controllers (can be in admin/kyc.admin.controller.js) ---

// const getKycDetailsAdmin = async (req, res, next) => {
//     try {
//         const { userId } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//              return res.status(400).json({ message: 'Invalid user ID format.' });
//         }
//         const userWithKyc = await kycService.getKycDetailsAdmin(userId);
//         res.status(200).json(userWithKyc); // Send full user object with KYC
//     } catch (error) {
//          if (error.message.includes('Invalid user ID format')) {
//              return res.status(400).json({ message: error.message });
//          }
//          if (error.message.includes('User not found')) {
//              return res.status(404).json({ message: error.message });
//          }
//         next(error);
//     }
// };

// const updateKycStatusAdmin = async (req, res, next) => {
//     try {
//         const adminUserId = req.user._id; // Admin making the change
//         const { userId } = req.params; // Target user
//         const { status, rejectionReason } = req.body; // 'verified' or 'rejected'

//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: 'Invalid target user ID format.' });
//         }
//         if (!status) {
//              return res.status(400).json({ message: 'Status (verified/rejected) is required.' });
//         }

//         const updatedKyc = await kycService.updateKycStatusAdmin(adminUserId, userId, status, rejectionReason);
//         res.status(200).json({ message: `User KYC status updated to ${status}.`, kyc: updatedKyc });
//     } catch (error) {
//          if (error.message.includes('Invalid') || error.message.includes('required')) {
//             return res.status(400).json({ message: error.message });
//         }
//         if (error.message.includes('not found')) {
//              return res.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// };


// export default {
//     submitKyc,
//     skipKyc,
//     getMyKycStatus,
//     updateMyKycDetails,
//     // Admin
//     getKycDetailsAdmin,
//     updateKycStatusAdmin,
// };

// // backend/src/controllers/kyc.controller.js
// import kycService from '../services/kyc.service.js'; // Import the USER service functions
// import mongoose from 'mongoose'; // If needed for validation

// // --- User KYC Controller Functions ---

// const submitKyc = async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const kycData = req.body; // Make sure to parse dates correctly here!
//         const files = req.files; // From multer upload

//         // --- Data Parsing & Validation ---
//         // Example: Parse date strings into Date objects
//         if (kycData.dateOfBirth) kycData.dateOfBirth = new Date(kycData.dateOfBirth);
//         if (kycData.idIssueDate) kycData.idIssueDate = new Date(kycData.idIssueDate);
//         if (kycData.idExpiryDate) kycData.idExpiryDate = new Date(kycData.idExpiryDate);

//         // Add more robust validation here before calling service (e.g., using Joi or express-validator)
//         // Check required files based on idType
//         if (!files || !files.id_front || files.id_front.length === 0) {
//              return res.status(400).json({ message: 'Front ID document is required.' });
//         }
//         if (kycData.idType === 'resident_permit' && (!files.id_back || files.id_back.length === 0)) {
//             return res.status(400).json({ message: 'Back ID document is required for Resident Permit.' });
//         }
//         // ... other validations ...

//         const submittedKyc = await kycService.submitKyc(userId, kycData, files);
//         res.status(201).json({ message: 'KYC submitted successfully. Pending review.', kyc: submittedKyc });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during submitKyc:", error);
//         // Handle potential Cloudinary cleanup errors or specific validation errors
//         if (error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('missing')) {
//             return res.status(400).json({ message: error.message });
//         }
//         if (error.message.includes('already verified') || error.message.includes('currently pending')) {
//             return res.status(409).json({ message: error.message }); // Conflict
//         }
//         next(error);
//     }
// };

// const getMyKycStatus = async (req, res, next) => { // <<<<< ENSURE THIS FUNCTION EXISTS
//     try {
//         const userId = req.user._id;
//         const status = await kycService.getKycStatus(userId);
//         res.status(200).json(status);
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during getMyKycStatus:", error);
//          if (error.message.includes('not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// const updateMyKycDetails = async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const updateData = req.body; // Contains fields like firstName, lastName, mobile, salaryRange etc.

//         // Add validation for updateData here
//         // Example: Check if mobile object is valid if provided
//         if (updateData.mobile && (typeof updateData.mobile !== 'object' || !updateData.mobile.countryCode || !updateData.mobile.number)) {
//             return res.status(400).json({ message: 'Invalid mobile format. Expected { countryCode, number }.' });
//         }
//         // ... more validation ...

//         const updatedKyc = await kycService.updateKycDetails(userId, updateData);
//         res.status(200).json({ message: 'KYC details updated successfully.', kyc: updatedKyc });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during updateMyKycDetails:", error);
//         if (error.message.includes('Invalid') || error.message.includes('No valid')) {
//              return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot update details')) { // Status conflict
//              return res.status(409).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// const skipKyc = async (req, res, next) => {
//     try {
//         const userId = req.user._id;
//         const result = await kycService.skipKyc(userId);
//         res.status(200).json({ message: 'KYC process skipped.', status: result.status });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during skipKyc:", error);
//         if (error.message.includes('not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot skip KYC')) { // Status conflict
//             return res.status(409).json({ message: error.message });
//         }
//         next(error);
//     }
// };


// // --- Make sure ALL functions used in kyc.routes.js are exported ---
// export default {
//     submitKyc,
//     getMyKycStatus, // <<<<< ENSURE THIS IS IN THE EXPORT
//     updateMyKycDetails,
//     skipKyc,
// };


// // backend/controllers/kyc.controller.js
// import kycService from '../services/kyc.service.js';
// import mongoose from 'mongoose';
// import AppError from '../utils/AppError.js'; // Assuming AppError is in utils

// // --- User KYC Controller Functions ---

// const submitKyc = async (req, res, next) => {
//     // --- Start of Controller ---
//     console.log('===========================================');
//     console.log('[KYC Controller] === ENTERED submitKyc ===');
//     console.log('[KYC Controller] Timestamp:', new Date().toISOString());
//     console.log('[KYC Controller] User ID from req.user:', req.user?._id);
//     console.log('[KYC Controller] Request Content-Type Header:', req.headers['content-type']);

//     // Log received data immediately
//     console.log('[KYC Controller] Raw req.body RECEIVED:', JSON.stringify(req.body, null, 2));
//     console.log('[KYC Controller] Raw req.files RECEIVED:', JSON.stringify(req.files, null, 2));
//     // --- End Initial Logs ---

//     try {
//         const userId = req.user?._id; // Use optional chaining for safety
//         const kycData = req.body;
//         const files = req.files; // This SHOULD be populated by the middleware

//         // --- Critical Pre-checks ---
//         if (!userId) {
//             console.error('[KYC Controller] CRITICAL CHECK FAILED: User ID missing from req.user.');
//             // Don't call next() with generic error, respond directly for auth issues
//             return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         }
//         if (typeof kycData !== 'object' || kycData === null) {
//             console.error('[KYC Controller] CRITICAL CHECK FAILED: req.body is not a valid object.', kycData);
//             return res.status(400).json({ message: 'Invalid request format: Body is missing or not an object.' });
//         }
//          // Check if files object exists AND is an object (Multer populates it as {})
//          if (typeof files === 'undefined' || files === null ) {
//              console.error('[KYC Controller] CRITICAL CHECK FAILED: req.files is undefined or null. Multer middleware likely failed before populating req.files.');
//              // Log headers again, might give clues if Content-Type is wrong
//              console.log('[KYC Controller] Headers at file check failure:', JSON.stringify(req.headers, null, 2));
//              return res.status(500).json({ message: 'Internal server error: File processing setup failed.' });
//          }
//          if (typeof files !== 'object' || Array.isArray(files)) {
//              console.error('[KYC Controller] CRITICAL CHECK FAILED: req.files is not an object.', files);
//              return res.status(500).json({ message: 'Internal server error: File processing resulted in invalid format.' });
//          }
//         // --- End Critical Pre-checks ---

//         console.log('[KYC Controller] Passed initial critical checks.');

//         // --- Data Parsing & Validation ---
//         // Use try-catch for parsing as it can fail
//         let parsedMobile;
//         try {
//             // Date Parsing
//             if (!kycData.dateOfBirth) throw new Error('Missing dateOfBirth');
//             if (!kycData.idIssueDate) throw new Error('Missing idIssueDate');
//             if (!kycData.idExpiryDate) throw new Error('Missing idExpiryDate');
//             kycData.dateOfBirth = new Date(kycData.dateOfBirth);
//             kycData.idIssueDate = new Date(kycData.idIssueDate);
//             kycData.idExpiryDate = new Date(kycData.idExpiryDate);

//             if (isNaN(kycData.dateOfBirth.getTime()) || isNaN(kycData.idIssueDate.getTime()) || isNaN(kycData.idExpiryDate.getTime())) {
//                  throw new Error('Invalid date value encountered after parsing.');
//             }
//             console.log('[KYC Controller] Dates parsed successfully.');

//             // Mobile Parsing
//             if (!kycData.mobile) throw new Error('Missing mobile data');
//             if (typeof kycData.mobile === 'string') {
//                 parsedMobile = JSON.parse(kycData.mobile);
//                 console.log('[KYC Controller] Mobile JSON parsed successfully.');
//             } else if (typeof kycData.mobile === 'object') {
//                  parsedMobile = kycData.mobile; // Assume it's already an object
//                  console.log('[KYC Controller] Mobile data received as object.');
//             } else {
//                  throw new Error('Mobile data is not a string or object.');
//             }
//              // Mobile Validation
//             if (typeof parsedMobile !== 'object' || !parsedMobile?.countryCode?.trim() || !parsedMobile?.number?.trim()) {
//                  throw new Error('Invalid mobile structure: countryCode and number required.');
//             }
//             kycData.mobile = parsedMobile; // Assign potentially parsed object back
//             console.log('[KYC Controller] Mobile data validated successfully.');

//         } catch (parseValidationError) {
//              console.error(`[KYC Controller] Data parsing/validation error for User ${userId}:`, parseValidationError.message);
//              // Log the problematic data
//              console.log('[KYC Controller] Data at point of parsing error:', { dob: req.body.dateOfBirth, issue: req.body.idIssueDate, expiry: req.body.idExpiryDate, mobile: req.body.mobile });
//              return res.status(400).json({ message: `Invalid or missing data: ${parseValidationError.message}. Please check your input.` });
//         }
//         // --- End Data Parsing & Validation ---


//         // --- File Validation (Based on req.files) ---
//         console.log('[KYC Controller] Performing file validation...');
//         // Check 'id_front' exists in the 'files' object AND is a non-empty array
//         if (!files.id_front || !Array.isArray(files.id_front) || files.id_front.length === 0) {
//              console.error('[KYC Controller] VALIDATION FAILED: id_front missing or invalid in req.files.', files);
//              return res.status(400).json({ message: 'Required Front ID document was not uploaded or received correctly.' });
//         } else {
//              console.log(`[KYC Controller] Found id_front: ${files.id_front[0]?.filename || 'details unavailable'}`);
//         }

//         // Check 'id_back' only if required
//         if (kycData.idType === 'resident_permit') {
//             if (!files.id_back || !Array.isArray(files.id_back) || files.id_back.length === 0) {
//                 console.error('[KYC Controller] VALIDATION FAILED: id_back missing for resident_permit.', files);
//                 return res.status(400).json({ message: 'Required Back ID document for Resident Permit was not uploaded or received correctly.' });
//             } else {
//                  console.log(`[KYC Controller] Found id_back: ${files.id_back[0]?.filename || 'details unavailable'}`);
//             }
//         }
//         console.log('[KYC Controller] File validation passed.');
//         // --- End File Validation ---


//         // --- Call Service ---
//         console.log(`[KYC Controller] Calling kycService.submitKyc for User: ${userId}`);
//         const submittedKyc = await kycService.submitKyc(userId, kycData, files); // Pass the validated kycData and files object
//         console.log(`[KYC Controller] kycService.submitKyc completed successfully.`);

//         // --- Success Response ---
//         res.status(201).json({
//             message: 'KYC submitted successfully and is pending review.',
//             kyc: submittedKyc
//         });
//         console.log('[KYC Controller] === submitKyc Responded 201 ===');

//     } catch (error) {
//         // --- Error Handling ---
//         console.error("[KYC Controller] --- ERROR Caught in submitKyc ---", error);
//         // Log specific details if available
//         if (error instanceof AppError) {
//             console.error(`[KYC Controller] AppError: ${error.message}, Status: ${error.statusCode}, Operational: ${error.isOperational}`);
//         } else if (error.name === 'ValidationError') { // Mongoose validation error from service save
//              console.error(`[KYC Controller] Mongoose Validation Error: ${error.message}`);
//              // Respond directly with 400 for validation errors
//              const messages = Object.values(error.errors).map(el => el.message);
//              return res.status(400).json({ message: `Validation failed: ${messages.join('. ')}` });
//         }

//         // Let the global error handler deal with it
//         // It can check error.statusCode or error.isOperational
//         next(error);
//          console.log('[KYC Controller] === submitKyc Passed error to next() ===');
//     }
//     console.log('===========================================');
// };


// // --- Other controller functions (getMyKycStatus, updateMyKycDetails, skipKyc) ---
// // (Keep them as they were in the previous answer, ensure they also have robust logging if needed)
// const getMyKycStatus = async (req, res, next) => {
//     console.log('[KYC Controller] GET /status');
//     try {
//         const userId = req.user?._id;
//         if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         console.log(`[KYC Controller] Getting KYC status for User: ${userId}`);
//         const status = await kycService.getKycStatus(userId);
//         res.status(200).json(status);
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during getMyKycStatus:", error);
//          if (error.message.includes('User not found') || error.message.includes('Invalid user ID')) {
//             // Handle case where user exists but has no KYC record yet vs user truly not found
//             // kycService.getKycStatus should return { status: 'not_started' } in the former case.
//             return res.status(404).json({ message: error.message }); // Or adjust based on service behavior
//         }
//         next(error);
//     }
// };

// const updateMyKycDetails = async (req, res, next) => {
//      console.log('[KYC Controller] PUT /update-details');
//     try {
//         const userId = req.user?._id;
//         if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         const updateData = req.body;
//         console.log(`[KYC Controller] Received update details request for User: ${userId}`, updateData);
//         // Basic validation
//         if (updateData.mobile && (typeof updateData.mobile !== 'object' || !updateData.mobile.countryCode?.trim() || !updateData.mobile.number?.trim())) {
//             return res.status(400).json({ message: 'Invalid mobile format. Expected { countryCode, number }.' });
//         }
//         if (updateData.salaryRange && !['0-1000', '10000-50000', '50000-100000', '100000+', null].includes(updateData.salaryRange)) {
//              return res.status(400).json({ message: 'Invalid salary range value provided.' });
//         }
//         console.log(`[KYC Controller] Calling kycService.updateKycDetails for User: ${userId}`);
//         const updatedKyc = await kycService.updateKycDetails(userId, updateData);
//         res.status(200).json({ message: 'KYC details updated successfully.', kyc: updatedKyc });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during updateMyKycDetails:", error);
//         if (error.message.includes('Invalid') || error.message.includes('No valid fields') || error.message.includes('Expected')) {
//              return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('not found')) { // User not found by service
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot update details')) { // Status conflict etc.
//              return res.status(409).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// const skipKyc = async (req, res, next) => {
//     console.log('[KYC Controller] POST /skip');
//     try {
//         const userId = req.user?._id;
//         if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         console.log(`[KYC Controller] Received skip request for User: ${userId}`);
//         const result = await kycService.skipKyc(userId);
//         res.status(200).json({ message: 'KYC process skipped successfully.', status: result.status });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during skipKyc:", error);
//         if (error.message.includes('not found') || error.message.includes('Invalid user ID')) {
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot skip KYC')) { // Status conflict
//             return res.status(409).json({ message: error.message });
//         }
//         next(error);
//     }
// };


// export default {
//     submitKyc,
//     getMyKycStatus,
//     updateMyKycDetails,
//     skipKyc,
// };



// // backend/controllers/kyc.controller.js
// import kycService from '../services/kyc.service.js';
// import mongoose from 'mongoose';
// import AppError from '../utils/AppError.js'; // Assuming AppError is in utils

// // --- User KYC Controller Functions ---

// const submitKyc = async (req, res, next) => {
//     // --- Start of Controller ---
//     console.log('===========================================');
//     console.log('[KYC Controller] === ENTERED submitKyc ===');
//     console.log('[KYC Controller] Timestamp:', new Date().toISOString());
//     console.log('[KYC Controller] User ID from req.user:', req.user?._id);
//     console.log('[KYC Controller] Request Content-Type Header:', req.headers['content-type']);

//     // Log received data immediately
//     console.log('[KYC Controller] Raw req.body RECEIVED:', JSON.stringify(req.body, null, 2));
//     console.log('[KYC Controller] Raw req.files RECEIVED:', JSON.stringify(req.files, null, 2));
//     // --- End Initial Logs ---

//     try {
//         const userId = req.user?._id; // Use optional chaining for safety
//         const kycDataInput = req.body; // Raw input from FormData
//         const files = req.files; // This SHOULD be populated by the middleware

//         // --- Critical Pre-checks ---
//         if (!userId) {
//             console.error('[KYC Controller] CRITICAL CHECK FAILED: User ID missing from req.user.');
//             return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         }
//         // Check if kycDataInput exists and is an object
//         if (typeof kycDataInput !== 'object' || kycDataInput === null) {
//              console.error('[KYC Controller] CRITICAL CHECK FAILED: req.body is not a valid object.', kycDataInput);
//              return res.status(400).json({ message: 'Invalid request format: Body is missing or not an object.' });
//         }

//          // Check if files object exists AND is an object (Multer populates it as {} if no files, which is OK)
//          if (typeof files === 'undefined' || files === null ) {
//              console.error('[KYC Controller] CRITICAL CHECK FAILED: req.files is undefined or null. Multer middleware likely failed or Content-Type was wrong.');
//              console.log('[KYC Controller] Headers at file check failure:', JSON.stringify(req.headers, null, 2));
//              return res.status(500).json({ message: 'Internal server error: File processing middleware failed.' });
//          }
//          if (typeof files !== 'object' || Array.isArray(files)) { // Should be an object like { id_front: [], id_back: [] }
//              console.error('[KYC Controller] CRITICAL CHECK FAILED: req.files is not the expected object format.', files);
//              return res.status(500).json({ message: 'Internal server error: File processing resulted in invalid format.' });
//          }
//         // --- End Critical Pre-checks ---

//         console.log('[KYC Controller] Passed initial critical checks.');

//         // --- Data Parsing & Validation from req.body ---
//         // Create a new object to hold parsed/validated data
//         const validatedKycData = {};

//         // Helper function for date parsing
//         const parseDate = (dateString, fieldName) => {
//             if (!dateString) throw new Error(`Missing required field: ${fieldName}`);
//             const date = new Date(dateString);
//             if (isNaN(date.getTime())) {
//                  throw new Error(`Invalid date format for ${fieldName}: ${dateString}. Expected YYYY-MM-DD.`);
//             }
//             return date;
//         };

//         try {
//             // Required Fields
//             validatedKycData.firstName = kycDataInput.firstName?.trim();
//             validatedKycData.lastName = kycDataInput.lastName?.trim();
//             validatedKycData.nationality = kycDataInput.nationality?.trim();
//             validatedKycData.idType = kycDataInput.idType; // Validation happens in service/schema
//             validatedKycData.idNumber = kycDataInput.idNumber?.trim();

//             if (!validatedKycData.firstName) throw new Error('Missing required field: First Name');
//             if (!validatedKycData.lastName) throw new Error('Missing required field: Last Name');
//             if (!validatedKycData.nationality) throw new Error('Missing required field: Nationality');
//             if (!validatedKycData.idType) throw new Error('Missing required field: ID Type');
//             if (!validatedKycData.idNumber) throw new Error('Missing required field: ID Number');


//             // Dates
//             validatedKycData.dateOfBirth = parseDate(kycDataInput.dateOfBirth, 'Date of Birth');
//             validatedKycData.idIssueDate = parseDate(kycDataInput.idIssueDate, 'ID Issue Date');
//             validatedKycData.idExpiryDate = parseDate(kycDataInput.idExpiryDate, 'ID Expiry Date');
//             console.log('[KYC Controller] Dates parsed successfully.');

//             // Mobile Parsing & Basic Validation
//             if (!kycDataInput.mobile) throw new Error('Missing mobile data');
//             let parsedMobile;
//             if (typeof kycDataInput.mobile === 'string') {
//                  try {
//                     parsedMobile = JSON.parse(kycDataInput.mobile);
//                     console.log('[KYC Controller] Mobile JSON parsed successfully.');
//                  } catch (jsonError) {
//                      throw new Error('Invalid mobile data format. Expected JSON string.');
//                  }
//             } else if (typeof kycDataInput.mobile === 'object') { // Should not happen with FormData usually
//                  parsedMobile = kycDataInput.mobile;
//                  console.warn('[KYC Controller] Mobile data received unexpectedly as object.');
//             } else {
//                  throw new Error('Mobile data is not a string or object.');
//             }

//             // Mobile Structure Validation
//             if (typeof parsedMobile !== 'object' || !parsedMobile?.countryCode?.trim() || !parsedMobile?.number?.trim()) {
//                  throw new Error('Invalid mobile structure: countryCode and number (trimmed) are required.');
//             }
//             // Further mobile number validation (e.g., digits only) could be added here or in service
//             validatedKycData.mobile = {
//                 countryCode: parsedMobile.countryCode.trim(),
//                 number: parsedMobile.number.trim()
//             };
//             console.log('[KYC Controller] Mobile data validated successfully.');

//             // Optional Fields
//             validatedKycData.occupation = kycDataInput.occupation?.trim() || null; // Use null if empty/missing
//             validatedKycData.salaryRange = kycDataInput.salaryRange || null; // Use null if empty/missing
//              // Validate salary range if provided
//              const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
//              if (validatedKycData.salaryRange !== null && !validSalaryRanges.includes(validatedKycData.salaryRange)) {
//                   throw new Error(`Invalid salary range value: ${validatedKycData.salaryRange}`);
//              }


//         } catch (validationError) {
//              console.error(`[KYC Controller] Data parsing/validation error for User ${userId}:`, validationError.message);
//              console.log('[KYC Controller] Body data at point of validation error:', kycDataInput);
//              return res.status(400).json({ message: validationError.message }); // Send specific error
//         }
//         // --- End Data Parsing & Validation ---


//         // --- File Validation (Based on req.files populated by Multer) ---
//         console.log('[KYC Controller] Performing file validation...');
//         // Check 'id_front' exists in the 'files' object AND is a non-empty array with at least one file
//         if (!files.id_front || !Array.isArray(files.id_front) || files.id_front.length === 0) {
//              console.error('[KYC Controller] VALIDATION FAILED: id_front missing or invalid in req.files.', files);
//              return res.status(400).json({ message: 'Required Front ID document was not uploaded or received correctly.' });
//         } else {
//              console.log(`[KYC Controller] Found id_front: ${files.id_front[0]?.filename || 'details unavailable'}`);
//         }

//         // Check 'id_back' only if required based on the *validated* idType
//         if (validatedKycData.idType === 'resident_permit') {
//             if (!files.id_back || !Array.isArray(files.id_back) || files.id_back.length === 0) {
//                 console.error('[KYC Controller] VALIDATION FAILED: id_back missing for resident_permit.', files);
//                 return res.status(400).json({ message: 'Required Back ID document for Resident Permit was not uploaded or received correctly.' });
//             } else {
//                  console.log(`[KYC Controller] Found id_back: ${files.id_back[0]?.filename || 'details unavailable'}`);
//             }
//         }
//         console.log('[KYC Controller] File presence validation passed.');
//         // --- End File Validation ---


//         // --- Call Service ---
//         console.log(`[KYC Controller] Calling kycService.submitKyc for User: ${userId}`);
//         // Pass the *validated* kycData and the original files object
//         const submittedKyc = await kycService.submitKyc(userId, validatedKycData, files);
//         console.log(`[KYC Controller] kycService.submitKyc completed successfully.`);

//         // --- Success Response ---
//         res.status(201).json({
//             message: 'KYC submitted successfully and is pending review.',
//             kyc: submittedKyc // Return the saved KYC subdocument
//         });
//         console.log('[KYC Controller] === submitKyc Responded 201 ===');

//     } catch (error) {
//         // --- Error Handling ---
//         console.error("[KYC Controller] --- ERROR Caught in submitKyc ---", error);
//         // Log specific details if available
//         if (error instanceof AppError) {
//             console.error(`[KYC Controller] AppError: ${error.message}, Status: ${error.statusCode}, Operational: ${error.isOperational}`);
//         } else if (error.name === 'ValidationError') { // Mongoose validation error from service save
//              console.error(`[KYC Controller] Mongoose Validation Error: ${error.message}`);
//              const messages = Object.values(error.errors).map(el => el.message);
//              return res.status(400).json({ message: `Validation failed: ${messages.join('. ')}` });
//         } else if (error.message.includes('User not found') || error.message.includes('Invalid user ID')) {
//              return res.status(404).json({ message: error.message });
//         } else if (error.message.includes('KYC is already verified') || error.message.includes('KYC submission is currently pending')) {
//              return res.status(409).json({ message: error.message }); // Conflict
//         }

//         // Let the global error handler deal with other errors
//         next(error);
//          console.log('[KYC Controller] === submitKyc Passed error to next() ===');
//     }
//     console.log('===========================================');
// };


// // --- Other controller functions (getMyKycStatus, updateMyKycDetails, skipKyc) ---
// // (Keep them as they were, but ensure they use lean() or appropriate selection in service)
// const getMyKycStatus = async (req, res, next) => {
//     console.log('[KYC Controller] GET /status');
//     try {
//         const userId = req.user?._id;
//         if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         console.log(`[KYC Controller] Getting KYC status for User: ${userId}`);
//         const status = await kycService.getKycStatus(userId); // Service should return lean object
//         res.status(200).json(status);
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during getMyKycStatus:", error);
//          if (error.message.includes('User not found') || error.message.includes('Invalid user ID')) {
//             // Service should return { status: 'not_started' } if KYC doesn't exist but user does
//             return res.status(404).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// const updateMyKycDetails = async (req, res, next) => {
//      console.log('[KYC Controller] PUT /update-details');
//     try {
//         const userId = req.user?._id;
//         if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         const updateData = req.body; // Expecting JSON body
//         console.log(`[KYC Controller] Received update details request for User: ${userId}`, updateData);

//         // Basic validation on controller level (more robust in service)
//         if (updateData.mobile && (typeof updateData.mobile !== 'object' || !updateData.mobile.countryCode?.trim() || !updateData.mobile.number?.trim())) {
//             return res.status(400).json({ message: 'Invalid mobile format. Expected { countryCode, number }.' });
//         }
//         const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
//         if (updateData.salaryRange && !validSalaryRanges.includes(updateData.salaryRange)) {
//              return res.status(400).json({ message: 'Invalid salary range value provided.' });
//         }

//         console.log(`[KYC Controller] Calling kycService.updateKycDetails for User: ${userId}`);
//         const updatedKyc = await kycService.updateKycDetails(userId, updateData); // Service returns updated lean KYC
//         res.status(200).json({ message: 'KYC details updated successfully.', kyc: updatedKyc });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during updateMyKycDetails:", error);
//         // Handle specific error types/messages from the service
//         if (error.message.includes('Invalid') || error.message.includes('No valid fields') || error.message.includes('Expected')) {
//              return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('not found')) { // User not found by service
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot update details')) { // Status conflict etc.
//              return res.status(409).json({ message: error.message });
//         }
//         next(error);
//     }
// };

// const skipKyc = async (req, res, next) => {
//     console.log('[KYC Controller] POST /skip');
//     try {
//         const userId = req.user?._id;
//         if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
//         console.log(`[KYC Controller] Received skip request for User: ${userId}`);
//         const result = await kycService.skipKyc(userId); // Service returns lean { status }
//         res.status(200).json({ message: 'KYC process skipped successfully.', status: result.status });
//     } catch (error) {
//         console.error("[KYC Controller - User] Error during skipKyc:", error);
//         if (error.message.includes('not found') || error.message.includes('Invalid user ID')) {
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot skip KYC')) { // Status conflict
//             return res.status(409).json({ message: error.message });
//         }
//         next(error);
//     }
// };


// export default {
//     submitKyc,
//     getMyKycStatus,
//     updateMyKycDetails,
//     skipKyc,
// };



// backend/controllers/kyc.controller.js
import kycService from '../services/kyc.service.js';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js'; // Assuming AppError is in utils

// --- User KYC Controller Functions ---

// submitKyc function remains the same as provided previously
const submitKyc = async (req, res, next) => {
    // --- Start of Controller ---
    console.log('===========================================');
    console.log('[KYC Controller] === ENTERED submitKyc ===');
    console.log('[KYC Controller] Timestamp:', new Date().toISOString());
    console.log('[KYC Controller] User ID from req.user:', req.user?._id);
    console.log('[KYC Controller] Request Content-Type Header:', req.headers['content-type']);

    // Log received data immediately
    console.log('[KYC Controller] Raw req.body RECEIVED:', JSON.stringify(req.body, null, 2));
    console.log('[KYC Controller] Raw req.files RECEIVED:', JSON.stringify(req.files, null, 2));
    // --- End Initial Logs ---

    try {
        const userId = req.user?._id; // Use optional chaining for safety
        const kycDataInput = req.body; // Raw input from FormData
        const files = req.files; // This SHOULD be populated by the middleware

        // --- Critical Pre-checks ---
        if (!userId) {
            console.error('[KYC Controller] CRITICAL CHECK FAILED: User ID missing from req.user.');
            return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        }
        // Check if kycDataInput exists and is an object
        if (typeof kycDataInput !== 'object' || kycDataInput === null) {
             console.error('[KYC Controller] CRITICAL CHECK FAILED: req.body is not a valid object.', kycDataInput);
             return res.status(400).json({ message: 'Invalid request format: Body is missing or not an object.' });
        }

         // Check if files object exists AND is an object (Multer populates it as {} if no files, which is OK)
         if (typeof files === 'undefined' || files === null ) {
             console.error('[KYC Controller] CRITICAL CHECK FAILED: req.files is undefined or null. Multer middleware likely failed or Content-Type was wrong.');
             console.log('[KYC Controller] Headers at file check failure:', JSON.stringify(req.headers, null, 2));
             return res.status(500).json({ message: 'Internal server error: File processing middleware failed.' });
         }
         if (typeof files !== 'object' || Array.isArray(files)) { // Should be an object like { id_front: [], id_back: [] }
             console.error('[KYC Controller] CRITICAL CHECK FAILED: req.files is not the expected object format.', files);
             return res.status(500).json({ message: 'Internal server error: File processing resulted in invalid format.' });
         }
        // --- End Critical Pre-checks ---

        console.log('[KYC Controller] Passed initial critical checks.');

        // --- Data Parsing & Validation from req.body ---
        // Create a new object to hold parsed/validated data
        const validatedKycData = {};

        // Helper function for date parsing
        const parseDate = (dateString, fieldName) => {
            if (!dateString) throw new Error(`Missing required field: ${fieldName}`);
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                 throw new Error(`Invalid date format for ${fieldName}: ${dateString}. Expected YYYY-MM-DD.`);
            }
            return date;
        };

        try {
            // Required Fields
            validatedKycData.firstName = kycDataInput.firstName?.trim();
            validatedKycData.lastName = kycDataInput.lastName?.trim();
            validatedKycData.nationality = kycDataInput.nationality?.trim();
            validatedKycData.idType = kycDataInput.idType; // Validation happens in service/schema
            validatedKycData.idNumber = kycDataInput.idNumber?.trim();

            if (!validatedKycData.firstName) throw new Error('Missing required field: First Name');
            if (!validatedKycData.lastName) throw new Error('Missing required field: Last Name');
            if (!validatedKycData.nationality) throw new Error('Missing required field: Nationality');
            if (!validatedKycData.idType) throw new Error('Missing required field: ID Type');
            if (!validatedKycData.idNumber) throw new Error('Missing required field: ID Number');


            // Dates
            validatedKycData.dateOfBirth = parseDate(kycDataInput.dateOfBirth, 'Date of Birth');
            validatedKycData.idIssueDate = parseDate(kycDataInput.idIssueDate, 'ID Issue Date');
            validatedKycData.idExpiryDate = parseDate(kycDataInput.idExpiryDate, 'ID Expiry Date');
            console.log('[KYC Controller] Dates parsed successfully.');

            // Mobile Parsing & Basic Validation
            if (!kycDataInput.mobile) throw new Error('Missing mobile data');
            let parsedMobile;
            if (typeof kycDataInput.mobile === 'string') {
                 try {
                    parsedMobile = JSON.parse(kycDataInput.mobile);
                    console.log('[KYC Controller] Mobile JSON parsed successfully.');
                 } catch (jsonError) {
                     throw new Error('Invalid mobile data format. Expected JSON string.');
                 }
            } else if (typeof kycDataInput.mobile === 'object') { // Should not happen with FormData usually
                 parsedMobile = kycDataInput.mobile;
                 console.warn('[KYC Controller] Mobile data received unexpectedly as object.');
            } else {
                 throw new Error('Mobile data is not a string or object.');
            }

            // Mobile Structure Validation
            if (typeof parsedMobile !== 'object' || !parsedMobile?.countryCode?.trim() || !parsedMobile?.number?.trim()) {
                 throw new Error('Invalid mobile structure: countryCode and number (trimmed) are required.');
            }
             // Further mobile number validation (e.g., digits only) could be added here or in service
             if (!/^[0-9]+$/.test(parsedMobile.number.trim())) {
                 throw new Error('Invalid mobile number format. Please enter only numbers.');
             }
            validatedKycData.mobile = {
                countryCode: parsedMobile.countryCode.trim(),
                number: parsedMobile.number.trim()
            };
            console.log('[KYC Controller] Mobile data validated successfully.');

            // Optional Fields
            validatedKycData.occupation = kycDataInput.occupation?.trim() || null; // Use null if empty/missing
            validatedKycData.salaryRange = kycDataInput.salaryRange || null; // Use null if empty/missing
             // Validate salary range if provided
             const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
             if (validatedKycData.salaryRange !== null && !validSalaryRanges.includes(validatedKycData.salaryRange)) {
                  throw new Error(`Invalid salary range value: ${validatedKycData.salaryRange}`);
             }


        } catch (validationError) {
             console.error(`[KYC Controller] Data parsing/validation error for User ${userId}:`, validationError.message);
             console.log('[KYC Controller] Body data at point of validation error:', kycDataInput);
             return res.status(400).json({ message: validationError.message }); // Send specific error
        }
        // --- End Data Parsing & Validation ---


        // --- File Validation (Based on req.files populated by Multer) ---
        console.log('[KYC Controller] Performing file validation...');
        // Check 'id_front' exists in the 'files' object AND is a non-empty array with at least one file
        if (!files.id_front || !Array.isArray(files.id_front) || files.id_front.length === 0) {
             console.error('[KYC Controller] VALIDATION FAILED: id_front missing or invalid in req.files.', files);
             return res.status(400).json({ message: 'Required Front ID document was not uploaded or received correctly.' });
        } else {
             console.log(`[KYC Controller] Found id_front: ${files.id_front[0]?.filename || 'details unavailable'}`);
        }

        // Check 'id_back' only if required based on the *validated* idType
        if (validatedKycData.idType === 'resident_permit') {
            if (!files.id_back || !Array.isArray(files.id_back) || files.id_back.length === 0) {
                console.error('[KYC Controller] VALIDATION FAILED: id_back missing for resident_permit.', files);
                return res.status(400).json({ message: 'Required Back ID document for Resident Permit was not uploaded or received correctly.' });
            } else {
                 console.log(`[KYC Controller] Found id_back: ${files.id_back[0]?.filename || 'details unavailable'}`);
            }
        }
        console.log('[KYC Controller] File presence validation passed.');
        // --- End File Validation ---


        // --- Call Service ---
        console.log(`[KYC Controller] Calling kycService.submitKyc for User: ${userId}`);
        // Pass the *validated* kycData and the original files object
        const submittedKyc = await kycService.submitKyc(userId, validatedKycData, files);
        console.log(`[KYC Controller] kycService.submitKyc completed successfully.`);

        // --- Success Response ---
        res.status(201).json({
            message: 'KYC submitted successfully and is pending review.',
            kyc: submittedKyc // Return the saved KYC subdocument
        });
        console.log('[KYC Controller] === submitKyc Responded 201 ===');

    } catch (error) {
        // --- Error Handling ---
        console.error("[KYC Controller] --- ERROR Caught in submitKyc ---", error);
        // Log specific details if available
        if (error instanceof AppError) {
            console.error(`[KYC Controller] AppError: ${error.message}, Status: ${error.statusCode}, Operational: ${error.isOperational}`);
        } else if (error.name === 'ValidationError') { // Mongoose validation error from service save
             console.error(`[KYC Controller] Mongoose Validation Error: ${error.message}`);
             const messages = Object.values(error.errors).map(el => el.message);
             return res.status(400).json({ message: `Validation failed: ${messages.join('. ')}` });
        } else if (error.message.includes('User not found') || error.message.includes('Invalid user ID')) {
             return res.status(404).json({ message: error.message });
        } else if (error.message.includes('KYC is already verified') || error.message.includes('KYC submission is currently pending')) {
             return res.status(409).json({ message: error.message }); // Conflict
        }

        // Let the global error handler deal with other errors
        next(error);
         console.log('[KYC Controller] === submitKyc Passed error to next() ===');
    }
    console.log('===========================================');
};

// getMyKycStatus function remains the same as provided previously
const getMyKycStatus = async (req, res, next) => {
    console.log('[KYC Controller] GET /status');
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        console.log(`[KYC Controller] Getting KYC status for User: ${userId}`);
        const status = await kycService.getKycStatus(userId); // Service should return lean object
        res.status(200).json(status);
    } catch (error) {
        console.error("[KYC Controller - User] Error during getMyKycStatus:", error);
         if (error.message.includes('User not found') || error.message.includes('Invalid user ID')) {
            // Service should return { status: 'not_started' } if KYC doesn't exist but user does
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

// *** MODIFIED updateMyKycDetails function's error handling ***
const updateMyKycDetails = async (req, res, next) => {
     console.log('[KYC Controller] PUT /update-details');
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        const updateData = req.body; // Expecting JSON body
        console.log(`[KYC Controller] Received update details request for User: ${userId}`, updateData);

        // Basic validation on controller level (more robust in service)
        // This validation might be redundant now service handles it better, but can stay as quick check
        if (updateData.mobile && (typeof updateData.mobile !== 'object' || !updateData.mobile.countryCode?.trim() || !updateData.mobile.number?.trim() || !/^[0-9]+$/.test(updateData.mobile.number.trim()))) {
            return res.status(400).json({ message: 'Invalid mobile format. Expected { countryCode, number (digits only) }.' });
        }
        const validSalaryRanges = ['0-1000', '10000-50000', '50000-100000', '100000+', null];
        if (updateData.salaryRange && !validSalaryRanges.includes(updateData.salaryRange)) {
             return res.status(400).json({ message: 'Invalid salary range value provided.' });
        }

        console.log(`[KYC Controller] Calling kycService.updateKycDetails for User: ${userId}`);
        const updatedKyc = await kycService.updateKycDetails(userId, updateData); // Service returns updated lean KYC
        res.status(200).json({ message: 'KYC details updated successfully.', kyc: updatedKyc });
    } catch (error) {
        console.error("[KYC Controller - User] Error during updateMyKycDetails:", error);

        // --- UPDATED Error Handling Block ---
        const errorMessage = error.message || 'An unexpected error occurred';

        // Handle specific validation/logic errors from the service with 400 Bad Request
        if (errorMessage.startsWith('Invalid') || errorMessage.includes('Expected') || errorMessage.includes('Missing') || errorMessage.includes('format')) {
             return res.status(400).json({ message: errorMessage });
        }
        // Handle "No valid fields provided" error with 400
        if (errorMessage.includes('No valid or permitted fields')) {
             return res.status(400).json({ message: errorMessage });
        }
        // **** NEW: Handle specific "Cannot update field..." error with 400 ****
        if (errorMessage.startsWith('Cannot update field')) {
            return res.status(400).json({ message: errorMessage });
        }
        // Handle "User not found" error with 404
         if (errorMessage.includes('not found')) { // User not found by service
            return res.status(404).json({ message: errorMessage });
        }
        // Handle status conflicts (e.g., trying to update when pending) with 409 Conflict
        if (errorMessage.includes('Cannot update details while KYC status is')) {
             return res.status(409).json({ message: errorMessage });
        }

        // Mongoose Validation Error (if service save fails validation) -> 400
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ message: `Validation failed: ${messages.join('. ')}` });
        }

        // Pass any other unexpected errors to the global error handler (which might result in 500)
        next(error);
        // --- END Updated Error Handling ---
    }
};

// skipKyc function remains the same as provided previously
const skipKyc = async (req, res, next) => {
    console.log('[KYC Controller] POST /skip');
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Authentication error: User ID not found.' });
        console.log(`[KYC Controller] Received skip request for User: ${userId}`);
        const result = await kycService.skipKyc(userId); // Service returns lean { status }
        res.status(200).json({ message: 'KYC process skipped successfully.', status: result.status });
    } catch (error) {
        console.error("[KYC Controller - User] Error during skipKyc:", error);
        if (error.message.includes('not found') || error.message.includes('Invalid user ID')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Cannot skip KYC')) { // Status conflict
            return res.status(409).json({ message: error.message });
        }
        next(error);
    }
};


export default {
    submitKyc,
    getMyKycStatus,
    updateMyKycDetails,
    skipKyc,
};