// // backend/src/services/kyc.service.js
// import User from '../../models/User.js';

// const getPendingKycUsersAdmin = async (options = {}) => {
//     // Example without pagination:
//     const query = { 'kyc.status': 'pending' };
//     // Select fields needed for the admin list (avoid sending full details here)
//     const selection = 'fullName email kyc.status kyc.submittedAt _id';
//     const users = await User.find(query).select(selection).sort({ 'kyc.submittedAt': 1 }).lean();
//     console.log(`[KYC Service - Admin] Fetched ${users.length} users with pending KYC.`);
//     return users;
// };

// const getKycDetailsAdmin = async (userId) => {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID format for admin view.');
//     }
//     // Select the full user but explicitly exclude password
//     // Include full kyc details
//     const user = await User.findById(userId).select('-password +kyc').lean(); // Use lean
//     if (!user) {
//         throw new Error('User not found for admin view.');
//     }
//     console.log(`[KYC Service - Admin] Fetched details for User: ${userId}`);
//     return user; // Return plain user object (minus password) with detailed KYC
// };

// const updateKycStatusAdmin = async (adminUserId, targetUserId, status, rejectionReason = null) => {
//     if (!mongoose.Types.ObjectId.isValid(targetUserId)) { throw new Error('Invalid target user ID format.'); }
//     if (!['verified', 'rejected'].includes(status)) { throw new Error('Invalid status. Must be "verified" or "rejected".'); }
//     if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) { throw new Error('Rejection reason is required when rejecting KYC.'); }

//     // Find the target user and select kyc for update
//     const user = await User.findById(targetUserId).select('+kyc');
//     if (!user) { throw new Error('Target user not found.'); }
//     if (!user.kyc) {
//         // Should not happen if user exists, indicates data inconsistency
//         console.error(`[KYC Service - Admin] Target user ${targetUserId} has no KYC record.`);
//         throw new Error(`Cannot update status. User KYC record does not exist.`);
//     }

//     // Allow update ONLY if status is 'pending'
//     if (user.kyc.status !== 'pending') {
//         console.warn(`[KYC Service - Admin] Attempted status update for User ${targetUserId} with status ${user.kyc.status} (expected 'pending') by Admin ${adminUserId}`);
//         throw new Error(`Cannot update status. User KYC status is currently "${user.kyc.status}", not "pending".`);
//     }

//     console.log(`[KYC Service - Admin] Updating status for User ${targetUserId} to ${status} by Admin ${adminUserId}`);
//     // Update KYC fields based on the new status
//     user.kyc.status = status;
//     user.kyc.rejectionReason = status === 'rejected' ? rejectionReason.trim() : null;
//     user.kyc.verifiedAt = status === 'verified' ? new Date() : null;
//     user.kyc.rejectedAt = status === 'rejected' ? new Date() : null;
//     user.kyc.lastUpdatedAt = new Date(); // Track this admin update

//     await user.save(); // Use save() to trigger potential middleware/hooks if needed
//     console.log(`[KYC Service - Admin] Status updated successfully for User ${targetUserId}`);

//     return user.kyc.toObject(); // Return updated KYC as plain object
// };

// export default {
//     getPendingKycUsersAdmin, // Add new export
//     getKycDetailsAdmin,
//     updateKycStatusAdmin,
// };


// // backend/services/admin/kyc.admin.service.js
// import mongoose from 'mongoose';
// import User from '../../models/User.js';

// //-----------------------------------------------------
// //  ADMIN KYC Service Logic
// //-----------------------------------------------------

// /**
//  * Fetches users whose KYC status is 'pending'.
//  * @returns {Promise<Array<Object>>} A promise that resolves to an array of pending users.
//  */
// const getPendingKycUsers = async () => {
//     console.log(`[KYC Admin Service] Fetching pending KYC users.`);
//     const query = { 'kyc.status': 'pending' };
//     // Select only necessary fields for the list view for performance and security
//     const selection = 'fullName email kyc.status kyc.submittedAt _id'; // Ensure _id is included
//     try {
//         const users = await User.find(query)
//             .select(selection)
//             .sort({ 'kyc.submittedAt': 1 }) // Sort by submission date, oldest first
//             .lean(); // Use lean for performance boost (plain JS objects)

//         console.log(`[KYC Admin Service] Found ${users.length} users with pending KYC.`);
//         return users;
//     } catch (error) {
//          console.error("[KYC Admin Service] Error fetching pending users:", error);
//          // Throw a more specific error or handle it based on requirements
//          throw new Error('Database error while fetching pending KYC users.');
//     }
// };

// /**
//  * Fetches detailed KYC information for a specific user.
//  * @param {string} userId - The ID of the user to fetch details for.
//  * @returns {Promise<Object>} A promise that resolves to the user object with KYC details.
//  */
// const getKycDetails = async (userId) => {
//     console.log(`[KYC Admin Service] Fetching details for User ID: ${userId}`);
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         console.warn(`[KYC Admin Service] Invalid User ID format received: ${userId}`);
//         // Note: Controller should ideally catch this first, but good practice to check here too.
//         throw new Error('Invalid User ID format.');
//     }

//     try {
//         const user = await User.findById(userId)
//             // Exclude sensitive fields explicitly if schema default is 'select: true'
//             .select('-password -resetPasswordToken -resetPasswordExpires -__v') // Exclude sensitive info
//             // No need to explicitly select '+kyc' if it's not excluded by default in the schema
//             .lean(); // Use lean for plain object

//         if (!user) {
//             console.warn(`[KYC Admin Service] User not found: ${userId}`);
//             throw new Error('User not found.'); // Throw specific error for controller
//         }

//         // Ensure KYC object exists, even if default (model pre-save should handle this)
//         if (!user.kyc) {
//             console.warn(`[KYC Admin Service] User ${userId} found but missing 'kyc' object. Providing default.`);
//             user.kyc = { status: 'not_started' }; // Add default structure if somehow missing
//         }

//         console.log(`[KYC Admin Service] Successfully fetched details for User: ${userId}`);
//         return user; // Return the full user object (excluding sensitive fields)

//     } catch (error) {
//          console.error(`[KYC Admin Service] Error fetching details for User ${userId}:`, error);
//          // Re-throw specific errors or a generic one
//          if (error.message === 'User not found.') throw error;
//          throw new Error('Database error while fetching KYC details.');
//     }
// };

// /**
//  * Updates the KYC status for a target user.
//  * @param {string} adminUserId - ID of the admin performing the action (for logging/audit).
//  * @param {string} targetUserId - ID of the user whose status is being updated.
//  * @param {'verified' | 'rejected'} status - The new status.
//  * @param {string | null} rejectionReason - Reason for rejection (required if status is 'rejected').
//  * @returns {Promise<Object>} A promise that resolves to the updated KYC subdocument object.
//  */
// const updateKycStatus = async (adminUserId, targetUserId, status, rejectionReason = null) => {
//     console.log(`[KYC Admin Service] Admin ${adminUserId} initiating status update for User ${targetUserId} to ${status}.`);

//     // Validate targetUserId format
//      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
//          throw new Error('Invalid Target User ID format.');
//      }
//      // Basic validation for status (controller should also validate)
//      if (!['verified', 'rejected'].includes(status)) {
//          throw new Error('Invalid status value provided. Must be "verified" or "rejected".');
//      }
//      if (status === 'rejected' && (!rejectionReason || String(rejectionReason).trim() === '')) {
//          throw new Error('Rejection reason is required when rejecting KYC.');
//      }


//     try {
//         // Find the user and select the KYC subdocument for update
//         const user = await User.findById(targetUserId).select('+kyc'); // Ensure kyc is selected

//         if (!user) {
//             console.warn(`[KYC Admin Service] Target user not found: ${targetUserId}`);
//             throw new Error('Target user not found.');
//         }
//         if (!user.kyc) {
//             console.warn(`[KYC Admin Service] Target user ${targetUserId} has no KYC record. Initializing default.`);
//             user.kyc = { status: 'not_started' }; // Initialize if somehow missing
//         }

//         // --- CRITICAL CHECK: Only allow updates if the status is currently 'pending' ---
//         if (user.kyc.status !== 'pending') {
//             console.warn(`[KYC Admin Service] Status update attempt for User ${targetUserId} with non-pending status (${user.kyc.status}) by Admin ${adminUserId}`);
//             throw new Error(`Cannot update status. User KYC status is currently "${user.kyc.status}", not "pending".`);
//         }

//         console.log(`[KYC Admin Service] Updating status for User ${targetUserId} to ${status}.`);
//         // Update the KYC subdocument fields
//         user.kyc.status = status;
//         user.kyc.rejectionReason = status === 'rejected' ? String(rejectionReason).trim() : null;
//         user.kyc.verifiedAt = status === 'verified' ? new Date() : null;
//         user.kyc.rejectedAt = status === 'rejected' ? new Date() : null;
//         user.kyc.lastUpdatedAt = new Date(); // Track the update time

//         // Save the changes to the user document
//         await user.save(); // This will trigger Mongoose validation if any apply to KYC subdoc

//         console.log(`[KYC Admin Service] Status updated successfully for User ${targetUserId} by Admin ${adminUserId}.`);
//         return user.kyc.toObject(); // Return the updated KYC subdocument as a plain object

//     } catch (error) {
//          console.error(`[KYC Admin Service] Error updating status for User ${targetUserId}:`, error);
//          // Re-throw specific errors or a generic one
//          if (error.message.includes('Target user not found') || error.message.includes('Cannot update status') || error.message.includes('Invalid status value')) {
//              throw error; // Pass specific errors to the controller
//          }
//           if (error.name === 'ValidationError') {
//              throw new Error(`Validation failed during status update: ${error.message}`);
//          }
//          throw new Error('Database error while updating KYC status.');
//     }
// };


// export default {
//     getPendingKycUsers,
//     getKycDetails,
//     updateKycStatus,
// };


// backend/services/admin/kyc.admin.service.js
import mongoose from 'mongoose';
import User from '../../models/User.js';
import notificationService from '../notification.service.js'; // <-- IMPORT NOTIFICATION SERVICE

//-----------------------------------------------------
//  ADMIN KYC Service Logic
//-----------------------------------------------------

/**
 * Fetches users whose KYC status is 'pending'.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of pending users.
 */
const getPendingKycUsers = async () => {
    console.log(`[KYC Admin Service] Fetching pending KYC users.`);
    const query = { 'kyc.status': 'pending' };
    const selection = 'fullName email kyc.status kyc.submittedAt _id';
    try {
        const users = await User.find(query)
            .select(selection)
            .sort({ 'kyc.submittedAt': 1 })
            .lean();

        console.log(`[KYC Admin Service] Found ${users.length} users with pending KYC.`);
        return users;
    } catch (error) {
         console.error("[KYC Admin Service] Error fetching pending users:", error);
         throw new Error('Database error while fetching pending KYC users.');
    }
};

/**
 * Fetches detailed KYC information for a specific user.
 * @param {string} userId - The ID of the user to fetch details for.
 * @returns {Promise<Object>} A promise that resolves to the user object with KYC details.
 */
const getKycDetails = async (userId) => {
    console.log(`[KYC Admin Service] Fetching details for User ID: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.warn(`[KYC Admin Service] Invalid User ID format received: ${userId}`);
        throw new Error('Invalid User ID format.');
    }

    try {
        const user = await User.findById(userId)
            .select('-password -resetPasswordToken -resetPasswordExpires -__v')
            .lean();

        if (!user) {
            console.warn(`[KYC Admin Service] User not found: ${userId}`);
            throw new Error('User not found.');
        }

        if (!user.kyc) {
            console.warn(`[KYC Admin Service] User ${userId} found but missing 'kyc' object. Providing default.`);
            user.kyc = { status: 'not_started' };
        }

        console.log(`[KYC Admin Service] Successfully fetched details for User: ${userId}`);
        return user;

    } catch (error) {
         console.error(`[KYC Admin Service] Error fetching details for User ${userId}:`, error);
         if (error.message === 'User not found.') throw error;
         throw new Error('Database error while fetching KYC details.');
    }
};

/**
 * Updates the KYC status for a target user and sends notifications.
 * @param {string} adminUserId - ID of the admin performing the action (for logging/audit).
 * @param {string} targetUserId - ID of the user whose status is being updated.
 * @param {'verified' | 'rejected'} status - The new status.
 * @param {string | null} rejectionReason - Reason for rejection (required if status is 'rejected').
 * @returns {Promise<Object>} A promise that resolves to the updated KYC subdocument object.
 */
const updateKycStatus = async (adminUserId, targetUserId, status, rejectionReason = null) => {
    console.log(`[KYC Admin Service] Admin ${adminUserId} initiating status update for User ${targetUserId} to ${status}.`);

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
         throw new Error('Invalid Target User ID format.');
    }
    if (!['verified', 'rejected'].includes(status)) {
         throw new Error('Invalid status value provided. Must be "verified" or "rejected".');
    }
    if (status === 'rejected' && (!rejectionReason || String(rejectionReason).trim() === '')) {
         throw new Error('Rejection reason is required when rejecting KYC.');
    }

    try {
        // Find the user and select KYC, email, and fullName for update and notification
        const user = await User.findById(targetUserId).select('+kyc +email +fullName'); // <-- ADDED +email +fullName

        if (!user) {
            console.warn(`[KYC Admin Service] Target user not found: ${targetUserId}`);
            throw new Error('Target user not found.');
        }
        if (!user.kyc) {
            console.warn(`[KYC Admin Service] Target user ${targetUserId} has no KYC record. Initializing default.`);
            user.kyc = { status: 'not_started' };
        }

        if (user.kyc.status !== 'pending') {
            console.warn(`[KYC Admin Service] Status update attempt for User ${targetUserId} with non-pending status (${user.kyc.status}) by Admin ${adminUserId}`);
            throw new Error(`Cannot update status. User KYC status is currently "${user.kyc.status}", not "pending".`);
        }

        console.log(`[KYC Admin Service] Updating status for User ${targetUserId} to ${status}.`);
        user.kyc.status = status;
        user.kyc.rejectionReason = status === 'rejected' ? String(rejectionReason).trim() : null;
        user.kyc.verifiedAt = status === 'verified' ? new Date() : null;
        user.kyc.rejectedAt = status === 'rejected' ? new Date() : null;
        user.kyc.lastUpdatedAt = new Date();

        await user.save();
        console.log(`[KYC Admin Service] Status updated successfully for User ${targetUserId} by Admin ${adminUserId}.`);

        // --- Send Notification to User ---
        try {
            if (status === 'verified') {
                console.log(`[KYC Admin Service] Attempting to send KYC approved notification to ${user.email}`);
                await notificationService.sendKycApprovedNotification(user); // Pass the full user object
            } else if (status === 'rejected') {
                console.log(`[KYC Admin Service] Attempting to send KYC rejected notification to ${user.email}`);
                // Ensure rejectionReason is passed correctly; it's already validated and trimmed
                await notificationService.sendKycRejectedNotification(user, user.kyc.rejectionReason);
            }
        } catch (notificationError) {
            // Log notification error but don't fail the main KYC update operation
            console.error(`[KYC Admin Service] Non-critical error sending KYC status notification for ${user.email}:`, notificationError);
        }
        // --- End Notification ---

        return user.kyc.toObject();

    } catch (error) {
         console.error(`[KYC Admin Service] Error updating status for User ${targetUserId}:`, error);
         if (error.message.includes('Target user not found') || error.message.includes('Cannot update status') || error.message.includes('Invalid status value')) {
             throw error;
         }
          if (error.name === 'ValidationError') {
             throw new Error(`Validation failed during status update: ${error.message}`);
         }
         throw new Error('Database error while updating KYC status.');
    }
};


export default {
    getPendingKycUsers,
    getKycDetails,
    updateKycStatus,
};