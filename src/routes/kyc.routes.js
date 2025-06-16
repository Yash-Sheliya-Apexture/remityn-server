// // backend/src/routes/kyc.routes.js
// import express from 'express';
// import kycController from '../controllers/kyc.controller.js';
// import authMiddleware from '../middleware/auth.middleware.js';
// import { uploadKycDocuments } from '../utils/storage.js'; // Import the multer middleware

// const router = express.Router();

// // --- User Routes ---
// // Submit KYC Data (Handles multipart/form-data including files)
// router.post(
//     '/submit',
//     authMiddleware.protect, // Ensure user is logged in
//     uploadKycDocuments,     // Use multer middleware to handle 'id_front', 'id_back' file uploads
//     kycController.submitKyc
// );

// // Get current user's KYC status
// router.get(
//     '/status',
//     authMiddleware.protect,
//     kycController.getMyKycStatus
// );

// // Update specific editable KYC details (e.g., name, mobile, salary)
// router.put(
//     '/update-details',
//     authMiddleware.protect,
//     kycController.updateMyKycDetails
// );

// // Endpoint to explicitly skip KYC for now
// router.post(
//     '/skip',
//     authMiddleware.protect,
//     kycController.skipKyc
// );


// export default router;


// // backend/src/routes/kyc.routes.js
// import express from 'express';
// import kycController from '../controllers/kyc.controller.js'; // Import the controller object
// import authMiddleware from '../middleware/auth.middleware.js';
// import { uploadKycDocuments } from '../utils/storage.js';

// const router = express.Router();

// // --- User Routes ---
// // Submit KYC Data
// router.post(
//     '/submit',
//     authMiddleware.protect,
//     uploadKycDocuments,
//     kycController.submitKyc // Check if submitKyc is exported from kyc.controller.js
// );

// // Get current user's KYC status  <<<<<<<<<<<<<< LINE 19 AREA
// router.get(
//     '/status',
//     authMiddleware.protect,
//     kycController.getMyKycStatus // <<<<<<<< ERROR SOURCE
// );

// // Update specific editable KYC details
// router.put(
//     '/update-details',
//     authMiddleware.protect,
//     kycController.updateMyKycDetails // Check if updateMyKycDetails is exported
// );

// // Endpoint to explicitly skip KYC
// router.post(
//     '/skip',
//     authMiddleware.protect,
//     kycController.skipKyc // Check if skipKyc is exported
// );

// export default router;


// // backend/src/routes/kyc.routes.js
// import express from 'express';
// import kycController from '../controllers/kyc.controller.js'; // Import the controller object
// import authMiddleware from '../middleware/auth.middleware.js';
// import { uploadKycDocuments } from '../utils/storage.js';

// const router = express.Router();

// // --- User Routes ---
// // Submit KYC Data
// router.post(
//     '/submit',
//     authMiddleware.protect,
//     uploadKycDocuments,
//     kycController.submitKyc // Check if submitKyc is exported from kyc.controller.js
// );

// // Get current user's KYC status  <<<<<<<<<<<<<< LINE 19 AREA
// router.get(
//     '/status',
//     authMiddleware.protect,
//     kycController.getMyKycStatus // <<<<<<<< ERROR SOURCE
// );

// // Update specific editable KYC details
// router.put(
//     '/update-details',
//     authMiddleware.protect,
//     kycController.updateMyKycDetails // Check if updateMyKycDetails is exported
// );

// // Endpoint to explicitly skip KYC
// router.post(
//     '/skip',
//     authMiddleware.protect,
//     kycController.skipKyc // Check if skipKyc is exported
// );

// export default router;


// backend/routes/kyc.routes.js
import express from 'express';
import kycController from '../controllers/kyc.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
// Import the correctly configured middleware from storage.js
import { uploadKycDocuments } from '../utils/storage.js'; // VERIFY PATH is correct

const router = express.Router();

// --- User KYC Routes (Protected) ---

// Submit KYC Data (Multipart Form)
// POST /api/kyc/submit
// *** Explicit Middleware Order for this Route ***
router.post(
    '/submit',
    // 1. Authenticate the user FIRST
    authMiddleware.protect,
    // 2. Handle file uploads NEXT. Multer parses multipart/form-data,
    //    populating req.files and also correctly parsing text fields into req.body.
    uploadKycDocuments,
    // 3. Finally, run the controller which now has access to
    //    both req.body and req.files.
    kycController.submitKyc
);

// --- Other KYC Routes ---

// Get current user's KYC status (Doesn't need Multer)
// GET /api/kyc/status
router.get(
    '/status',
    authMiddleware.protect,       // Ensure user is logged in
    kycController.getMyKycStatus  // Fetch status { status, rejectionReason }
);

// Update specific editable KYC details (Uses JSON body, not Multer)
// PUT /api/kyc/update-details
router.put(
    '/update-details',
    authMiddleware.protect,       // Ensure user is logged in
    // Note: express.json() middleware applied globally in server.js will handle this body
    kycController.updateMyKycDetails // Process update data from req.body
);

// Endpoint to explicitly skip KYC (Doesn't need Multer or complex body)
// POST /api/kyc/skip
router.post(
    '/skip',
    authMiddleware.protect,       // Ensure user is logged in
    kycController.skipKyc         // Update status to 'skipped'
);

export default router;