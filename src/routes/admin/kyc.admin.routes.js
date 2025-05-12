// // backend/src/routes/admin/kyc.admin.routes.js
// import express from 'express';
// import kycController from '../../controllers/kyc.controller.js'; // Can reuse controller methods
// import authMiddleware from '../../middleware/auth.middleware.js';

// const router = express.Router();

// // Get full KYC details for a specific user (Admin only)
// router.get(
//     '/users/:userId', // Route param for the target user's ID
//     authMiddleware.protect,
//     authMiddleware.admin,
//     kycController.getKycDetailsAdmin // Use the specific admin controller method
// );

// // Update KYC status (verify/reject) for a specific user (Admin only)
// router.put(
//     '/users/:userId/status',
//     authMiddleware.protect,
//     authMiddleware.admin,
//     kycController.updateKycStatusAdmin // Use the specific admin controller method
// );

// export default router;

// // backend/src/routes/admin/kyc.admin.routes.js
// import express from 'express';
// import kycController from '../../controllers/admin/kyc.admin.controller.js';
// import authMiddleware from '../../middleware/auth.middleware.js';

// const router = express.Router();

// // NEW: Get users with pending KYC status
// router.get(
//     '/pending', // Or just '/' if this is the main view for /admin/kyc
//     authMiddleware.protect,
//     authMiddleware.admin,
//     kycController.getPendingKycUsersAdmin // Use the function from the imported controller
// );

// // Existing routes...
// router.get(
//     '/users/:userId',
//     authMiddleware.protect,
//     authMiddleware.admin,
//     kycController.getKycDetailsAdmin // Use the function from the imported controller
// );

// router.put(
//     '/users/:userId/status',
//     authMiddleware.protect,
//     authMiddleware.admin,
//     kycController.updateKycStatusAdmin // Use the function from the imported controller
// );

// export default router;


// backend/routes/admin/kyc.admin.routes.js
import express from 'express';
import kycAdminController from '../../controllers/admin/kyc.admin.controller.js'; // Correct controller import
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// --- Admin KYC Management Routes (Protected by Auth & Admin Role) ---

// Get list of users with PENDING KYC status
// GET /api/admin/kyc/pending
router.get(
    '/pending',
    authMiddleware.protect,      // Must be logged in
    authMiddleware.admin,        // Must be an admin
    kycAdminController.getPendingKycUsersAdmin // Controller action
);

// Get detailed KYC information for a SPECIFIC user by ID
// GET /api/admin/kyc/users/:userId
router.get(
    '/users/:userId',            // Parameter for the target user's ID
    authMiddleware.protect,
    authMiddleware.admin,
    kycAdminController.getKycDetailsAdmin
);

// Update the KYC status (approve/reject) for a SPECIFIC user by ID
// PUT /api/admin/kyc/users/:userId/status
router.put(
    '/users/:userId/status',     // Parameter for the target user's ID
    authMiddleware.protect,
    authMiddleware.admin,
    kycAdminController.updateKycStatusAdmin // Expects { status: 'verified'|'rejected', rejectionReason?: string } in body
);

// Optional: Route to get ALL users with KYC info (with pagination/filtering)
// GET /api/admin/kyc/all
// router.get(
//     '/all', // Or just '/' if pending is moved elsewhere
//     authMiddleware.protect,
//     authMiddleware.admin,
//     kycAdminController.getAllKycUsersAdmin // Need to create this controller/service logic
// );


export default router;