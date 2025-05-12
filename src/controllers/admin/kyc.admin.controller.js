// // backend/src/controllers/admin/kyc.admin.controller.js
// import mongoose from 'mongoose';
// import User from '../../models/User.js'; // <-- ADDED: Import User model directly

// const _getPendingKycUsersAdminLogic = async (options = {}) => {
//     const query = { 'kyc.status': 'pending' };
//     const selection = 'fullName email kyc.status kyc.submittedAt _id';
//     const users = await User.find(query).select(selection).sort({ 'kyc.submittedAt': 1 }).lean();
//     console.log(`[KYC Controller - Admin Logic] Fetched ${users.length} users with pending KYC.`);
//     return users;
// };

// const _getKycDetailsAdminLogic = async (userId) => {
//     // ID validation happens in the route handler
//     const user = await User.findById(userId)
//         // --- FIX: Only exclude password ---
//         .select('-password')
//         // Remove the explicit '+kyc'
//         .lean(); // Keep .lean() for plain objects

//     if (!user) {
//         throw new Error('User not found for admin view.');
//     }
//     // The 'kyc' field will be included by default now
//     if (!user.kyc) {
//         console.warn(`[KYC Controller - Admin Logic] User ${userId} found but missing 'kyc' object. Initializing default.`);
//         user.kyc = { status: 'not_started' }; // Add default structure if somehow missing
//     }
//     console.log(`[KYC Controller - Admin Logic] Fetched details for User: ${userId}`);
//     return user;
// };

// const _updateKycStatusAdminLogic = async (adminUserId, targetUserId, status, rejectionReason = null) => {
//     // ID and input validation happens in the route handler before calling this
//     const user = await User.findById(targetUserId).select('+kyc');
//     if (!user) { throw new Error('Target user not found.'); } // Specific error
//     if (!user.kyc) {
//         console.warn(`[KYC Controller - Admin Logic] Target user ${targetUserId} has no KYC record. Initializing.`);
//         user.kyc = { status: 'not_started' };
//     }

//     if (user.kyc.status !== 'pending') {
//         console.warn(`[KYC Controller - Admin Logic] Status update attempt for User ${targetUserId} with status ${user.kyc.status} (expected 'pending') by Admin ${adminUserId}`);
//         throw new Error(`Cannot update status. User KYC status is currently "${user.kyc.status}", not "pending".`); // Specific error
//     }

//     console.log(`[KYC Controller - Admin Logic] Updating status for User ${targetUserId} to ${status} by Admin ${adminUserId}`);
//     user.kyc.status = status;
//     user.kyc.rejectionReason = status === 'rejected' ? rejectionReason.trim() : null;
//     user.kyc.verifiedAt = status === 'verified' ? new Date() : null;
//     user.kyc.rejectedAt = status === 'rejected' ? new Date() : null;
//     user.kyc.lastUpdatedAt = new Date();

//     await user.save();
//     console.log(`[KYC Controller - Admin Logic] Status updated successfully for User ${targetUserId}`);
//     return user.kyc.toObject();
// };


// //-----------------------------------------------------
// //  ADMIN KYC ROUTE HANDLERS (Controllers)
// //-----------------------------------------------------

// // Route Handler for GET /admin/kyc/pending
// const getPendingKycUsersAdmin = async (req, res, next) => {
//     try {
//         const adminUserId = req.user._id;
//         console.log(`[KYC Controller - Admin] Admin ${adminUserId} requesting pending KYC users.`);

//         // Call the logic function defined *within this file*
//         const pendingUsers = await _getPendingKycUsersAdminLogic(/* pass pagination options if needed */);

//         res.status(200).json(pendingUsers);
//     } catch (error) {
//         console.error("[KYC Controller - Admin] Error during getPendingKycUsersAdmin:", error);
//         next(error); // Pass to global error handler
//     }
// };

// // Route Handler for GET /admin/kyc/users/:userId
// const getKycDetailsAdmin = async (req, res, next) => {
//     try {
//         const { userId } = req.params;
//         const adminUserId = req.user._id;

//         // Validate ID format first
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: 'Invalid target user ID format.' });
//         }

//         console.log(`[KYC Controller - Admin] Admin ${adminUserId} requesting details for User: ${userId}`);

//         // Call the logic function defined *within this file*
//         const userWithKyc = await _getKycDetailsAdminLogic(userId);

//         res.status(200).json(userWithKyc);
//     } catch (error) {
//         console.error("[KYC Controller - Admin] Error during getKycDetailsAdmin:", error);
//         // Handle specific errors thrown by the logic function
//         if (error.message.includes('User not found')) {
//             return res.status(404).json({ message: error.message });
//         }
//         // Handle other potential errors
//         next(error);
//     }
// };

// // Route Handler for PUT /admin/kyc/users/:userId/status
// const updateKycStatusAdmin = async (req, res, next) => {
//     try {
//         const adminUserId = req.user._id;
//         const { userId } = req.params;
//         const { status, rejectionReason } = req.body;

//         // --- Input Validation ---
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: 'Invalid target user ID format.' });
//         }
//         if (!status || !['verified', 'rejected'].includes(status)) {
//             return res.status(400).json({ message: 'Status is required and must be "verified" or "rejected".' });
//         }
//         if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
//             return res.status(400).json({ message: 'Rejection reason is required when rejecting KYC.' });
//         }
//         // --- End Validation ---

//         console.log(`[KYC Controller - Admin] Admin ${adminUserId} updating status for User: ${userId} to ${status}`);

//         // Call the logic function defined *within this file*
//         const updatedKyc = await _updateKycStatusAdminLogic(adminUserId, userId, status, rejectionReason);

//         res.status(200).json({ message: `User KYC status updated to ${status}.`, kyc: updatedKyc });
//     } catch (error) {
//         console.error("[KYC Controller - Admin] Error during updateKycStatusAdmin:", error);
//         // Handle specific errors thrown by the logic function
//         if (error.message.includes('not found')) { // Target user not found
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message.includes('Cannot update status')) { // e.g., status not pending
//              return res.status(400).json({ message: error.message });
//         }
//         // Handle other potential errors
//         next(error);
//     }
// };

// // --- EXPORT THE ROUTE HANDLERS ---
// export default {
//     getPendingKycUsersAdmin,
//     getKycDetailsAdmin,
//     updateKycStatusAdmin,
// };


// backend/controllers/admin/kyc.admin.controller.js
import mongoose from 'mongoose';
import User from '../../models/User.js'; // Direct import for finding users
import kycAdminService from '../../services/admin/kyc.admin.service.js'; // Import the admin service

//-----------------------------------------------------
//  ADMIN KYC ROUTE HANDLERS (Controllers)
//-----------------------------------------------------

// Route Handler for GET /admin/kyc/pending
const getPendingKycUsersAdmin = async (req, res, next) => {
    try {
        const adminUserId = req.user._id; // From auth middleware
        console.log(`[KYC Controller - Admin] Admin ${adminUserId} requesting pending KYC users.`);

        // Call the service function
        const pendingUsers = await kycAdminService.getPendingKycUsers();

        if (!pendingUsers) {
             return res.status(404).json({message: "Could not retrieve pending users."}) // Or maybe an empty array is fine
        }

        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("[KYC Controller - Admin] Error in getPendingKycUsersAdmin:", error);
        // Pass to global error handler, which can handle generic errors
        next(error);
    }
};

// Route Handler for GET /admin/kyc/users/:userId
const getKycDetailsAdmin = async (req, res, next) => {
    try {
        const { userId: targetUserId } = req.params; // Rename for clarity
        const adminUserId = req.user._id;

        // Validate targetUserId format early
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid target user ID format.' });
        }

        console.log(`[KYC Controller - Admin] Admin ${adminUserId} requesting details for User: ${targetUserId}`);

        // Call the service function
        const userWithKyc = await kycAdminService.getKycDetails(targetUserId);

        // Service handles the 'not found' case by throwing an error
        res.status(200).json(userWithKyc);

    } catch (error) {
        console.error("[KYC Controller - Admin] Error in getKycDetailsAdmin:", error);
        // Handle specific errors thrown by the service
        if (error.message.includes('User not found')) {
            return res.status(404).json({ message: error.message });
        }
        // Pass other errors to the global handler
        next(error);
    }
};

// Route Handler for PUT /admin/kyc/users/:userId/status
const updateKycStatusAdmin = async (req, res, next) => {
    try {
        const adminUserId = req.user._id;
        const { userId: targetUserId } = req.params; // Rename
        const { status, rejectionReason } = req.body;

        // --- Input Validation ---
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid target user ID format.' });
        }
        if (!status || !['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status is required and must be either "verified" or "rejected".' });
        }
        if (status === 'rejected' && (!rejectionReason || String(rejectionReason).trim() === '')) {
            return res.status(400).json({ message: 'A non-empty rejection reason is required when rejecting KYC.' });
        }
        // --- End Validation ---

        console.log(`[KYC Controller - Admin] Admin ${adminUserId} attempting update status for User: ${targetUserId} to ${status}`);

        // Call the service function
        const updatedKyc = await kycAdminService.updateKycStatus(
            adminUserId, // Pass admin ID for logging/audit purposes if needed
            targetUserId,
            status,
            rejectionReason // Pass reason (null if status is 'verified')
        );

        res.status(200).json({
            message: `User KYC status successfully updated to ${status}.`,
            kyc: updatedKyc // Return the updated KYC object
        });

    } catch (error) {
        console.error("[KYC Controller - Admin] Error in updateKycStatusAdmin:", error);
        // Handle specific errors thrown by the service
        if (error.message.includes('Target user not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Cannot update status')) { // e.g., status not pending, or other logic error
             return res.status(400).json({ message: error.message }); // Bad Request or Conflict (409)? 400 seems appropriate
        }
         if (error.message.includes('Invalid status value')) { // Should be caught by validation, but defensive
             return res.status(400).json({ message: error.message });
        }
        // Pass other errors to the global handler
        next(error);
    }
};

// --- EXPORT THE ROUTE HANDLERS ---
export default {
    getPendingKycUsersAdmin,
    getKycDetailsAdmin,
    updateKycStatusAdmin,
};