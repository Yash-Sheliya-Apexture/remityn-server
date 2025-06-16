// import User from '../models/User.js';

// const getAllUsers = async () => {
//     try {
//         return await User.find().select('-password'); // Exclude password field when fetching users
//     } catch (error) {
//         console.error("Error in getAllUsers service:", error);
//         throw new Error("Failed to fetch users.");
//     }
// };

// const getUserById = async (userId) => {
//     try {
//         const user = await User.findById(userId); // Default select (no password, maybe no kyc unless needed)
//         if (!user) {
//             return null; // Or throw a NotFoundError if you have custom errors
//         }
//         return user;
//     } catch (error) {
//         console.error("Error in getUserById service:", error);
//         throw new Error("Failed to fetch user.");
//     }
// };
// // Function to get user including their KYC details
// const getUserByIdWithKyc = async (userId) => {
//     try {
//         // Find by ID and explicitly select all necessary fields, including the kyc object
//         // The model's toJSON will remove password before sending response
//         const user = await User.findById(userId).select('+kyc'); // Select the whole kyc object

//         if (!user) {
//             return null;
//         }
//         return user; // Return the full user document (password removed by toJSON)
//     } catch (error) {
//         console.error(`Error in getUserByIdWithKyc for ${userId}:`, error);
//         throw new Error("Failed to fetch user details.");
//     }
// };
// export default {
//     getAllUsers,
//     getUserById,
//     getUserByIdWithKyc, // Export the new function
// };


// // backend/src/services/user.service.js
// import User from '../models/User.js';
// import mongoose from 'mongoose'; // <--- ADD THIS LINE
// /**
//  * Fetches user details including KYC information by user ID.
//  * @param {string} userId - The ID of the user to fetch.
//  * @returns {Promise<object>} The user object including KYC details.
//  * @throws {Error} If user not found or invalid ID format.
//  */
// const getAllUsers = async () => {
//     try {
//         // Exclude password field by default, include other necessary fields
//         // Consider adding pagination for large user bases
//         return await User.find().select('-password');
//     } catch (error) {
//         console.error("Error in getAllUsers service:", error);
//         throw new Error("Failed to fetch users.");
//     }
// };

// const getUserById = async (userId) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//              throw new Error('Invalid user ID format.');
//         }
//         // Default select excludes password due to schema toJSON, but explicitly ensure it
//         const user = await User.findById(userId).select('-password');
//         if (!user) {
//             return null; // Consistent return type
//         }
//         return user;
//     } catch (error) {
//         console.error(`Error in getUserById service for ${userId}:`, error);
//          if (error.message.includes('Invalid user ID format')) {
//              throw error; // Re-throw specific errors
//          }
//         throw new Error("Failed to fetch user.");
//     }
// };

// const getUserByIdWithKyc = async (userId) => {
//     // ... (ID validation) ...
//     try {
//         const user = await User.findById(userId)
//             .select('-password -resetPasswordToken -resetPasswordExpires -__v') // Exclude sensitive info
//             .lean(); // Use lean

//         if (!user) {
//             throw new Error('User not found.');
//         }

//         // ***** ENSURE DEFAULT KYC OBJECT *****
//         if (!user.kyc) {
//             console.warn(`[User Service] User ${userId} found but missing 'kyc' object in lean result. Providing default.`);
//             // Manually add the default structure if lean() didn't include it
//             user.kyc = {
//                 status: 'not_started',
//                 // Initialize other fields to null/defaults as needed by KycDetails type
//                 firstName: user.fullName?.split(' ')[0] || '', // Example prefill
//                 lastName: user.fullName?.split(' ').slice(1).join(' ') || '', // Example prefill
//                 dateOfBirth: null,
//                 mobile: null,
//                 occupation: null,
//                 salaryRange: null,
//                 nationality: null,
//                 idType: null,
//                 idNumber: null,
//                 idIssueDate: null,
//                 idExpiryDate: null,
//                 documents: [],
//                 submittedAt: null,
//                 verifiedAt: null,
//                 rejectedAt: null,
//                 rejectionReason: null,
//                 lastUpdatedAt: null,
//              };
//         } else if (typeof user.kyc !== 'object' || user.kyc === null) {
//              // Handle unexpected non-object kyc (shouldn't happen with schema default)
//              console.error(`[User Service] User ${userId} has invalid kyc field:`, user.kyc);
//              // Decide how to handle: throw error or force default? Forcing default might be safer.
//              user.kyc = { status: 'not_started', /* ... other defaults */ };
//         } else if (typeof user.kyc.status !== 'string') {
//             // Ensure status exists if kyc object exists
//             console.warn(`[User Service] User ${userId} kyc object missing status. Setting default.`);
//             user.kyc.status = 'not_started';
//         }
//         // *************************************

//         console.log(`[User Service] Successfully fetched and ensured KYC for user ID: ${userId}`);
//         return user; // Return the user object (including kyc)

//     } catch (error) {
//         // ... (error handling) ...
//         throw new Error('Failed to fetch user details.');
//     }
// };
// // --- End Function ---

// export default {
//     getAllUsers,
//     getUserById,
//     getUserByIdWithKyc, // Export the new function
// };


// // backend/src/services/user.service.js
// import User from '../models/User.js';
// import mongoose from 'mongoose'; // <--- ADD THIS LINE
// import bcrypt from 'bcryptjs'; // Import bcrypt
// /**
//  * Fetches user details including KYC information by user ID.
//  * @param {string} userId - The ID of the user to fetch.
//  * @returns {Promise<object>} The user object including KYC details.
//  * @throws {Error} If user not found or invalid ID format.
//  */

// /**
//  * Changes the password for a given user.
//  * @param {string} userId - The ID of the user changing the password.
//  * @param {string} currentPassword - The user's current password.
//  * @param {string} newPassword - The desired new password.
//  * @throws {Error} If user not found, current password mismatch, new password is same as old, or validation fails.
//  */


// const getAllUsers = async () => {
//     try {
//         // Exclude password field by default, include other necessary fields
//         // Consider adding pagination for large user bases
//         return await User.find().select('-password');
//     } catch (error) {
//         console.error("Error in getAllUsers service:", error);
//         throw new Error("Failed to fetch users.");
//     }
// };

// const getUserById = async (userId) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//              throw new Error('Invalid user ID format.');
//         }
//         // Default select excludes password due to schema toJSON, but explicitly ensure it
//         const user = await User.findById(userId).select('-password');
//         if (!user) {
//             return null; // Consistent return type
//         }
//         return user;
//     } catch (error) {
//         console.error(`Error in getUserById service for ${userId}:`, error);
//          if (error.message.includes('Invalid user ID format')) {
//              throw error; // Re-throw specific errors
//          }
//         throw new Error("Failed to fetch user.");
//     }
// };

// const getUserByIdWithKyc = async (userId) => {
//     // ... (ID validation) ...
//     try {
//         const user = await User.findById(userId)
//             .select('-password -resetPasswordToken -resetPasswordExpires -__v') // Exclude sensitive info
//             .lean(); // Use lean

//         if (!user) {
//             throw new Error('User not found.');
//         }

//         // ***** ENSURE DEFAULT KYC OBJECT *****
//         if (!user.kyc) {
//             console.warn(`[User Service] User ${userId} found but missing 'kyc' object in lean result. Providing default.`);
//             // Manually add the default structure if lean() didn't include it
//             user.kyc = {
//                 status: 'not_started',
//                 // Initialize other fields to null/defaults as needed by KycDetails type
//                 firstName: user.fullName?.split(' ')[0] || '', // Example prefill
//                 lastName: user.fullName?.split(' ').slice(1).join(' ') || '', // Example prefill
//                 dateOfBirth: null,
//                 mobile: null,
//                 occupation: null,
//                 salaryRange: null,
//                 nationality: null,
//                 idType: null,
//                 idNumber: null,
//                 idIssueDate: null,
//                 idExpiryDate: null,
//                 documents: [],
//                 submittedAt: null,
//                 verifiedAt: null,
//                 rejectedAt: null,
//                 rejectionReason: null,
//                 lastUpdatedAt: null,
//              };
//         } else if (typeof user.kyc !== 'object' || user.kyc === null) {
//              // Handle unexpected non-object kyc (shouldn't happen with schema default)
//              console.error(`[User Service] User ${userId} has invalid kyc field:`, user.kyc);
//              // Decide how to handle: throw error or force default? Forcing default might be safer.
//              user.kyc = { status: 'not_started', /* ... other defaults */ };
//         } else if (typeof user.kyc.status !== 'string') {
//             // Ensure status exists if kyc object exists
//             console.warn(`[User Service] User ${userId} kyc object missing status. Setting default.`);
//             user.kyc.status = 'not_started';
//         }
//         // *************************************

//         console.log(`[User Service] Successfully fetched and ensured KYC for user ID: ${userId}`);
//         return user; // Return the user object (including kyc)

//     } catch (error) {
//         // ... (error handling) ...
//         throw new Error('Failed to fetch user details.');
//     }
// };

// const changeUserPassword = async (userId, currentPassword, newPassword) => {
//     console.log(`[User Service - changeUserPassword] Attempting password change for user ID: ${userId}`);

//     // Validate inputs (Basic validation, more robust in validator middleware)
//     if (!userId || !currentPassword || !newPassword) {
//         throw new Error('Missing required fields for password change.');
//     }
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID format.');
//     }
//     if (newPassword.length < 8) { // Basic length check (schema/validator enforces more)
//          throw new Error('New password must be at least 8 characters long.');
//     }

//     try {
//         // Fetch the user, ensuring the password field is included
//         const user = await User.findById(userId).select('+password');

//         if (!user) {
//             console.error(`[User Service - changeUserPassword] User not found: ${userId}`);
//             throw new Error('User not found.'); // Should ideally not happen if called after authMiddleware
//         }

//         // Verify the current password
//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             console.log(`[User Service - changeUserPassword] Incorrect current password for user: ${userId}`);
//             throw new Error('Incorrect current password.'); // Specific error type
//         }

//         // Check if the new password is the same as the old one
//         if (currentPassword === newPassword) {
//              console.log(`[User Service - changeUserPassword] New password is the same as the current one for user: ${userId}`);
//              throw new Error('New password cannot be the same as the current one.'); // Specific error type
//         }

//         // If all checks pass, assign the new password.
//         // The pre-save hook in the User model will handle hashing.
//         user.password = newPassword;
//         await user.save(); // Trigger the pre-save hook and save changes

//         console.log(`[User Service - changeUserPassword] Password successfully updated for user: ${userId}`);
//         // No return value needed for success, void is fine.

//     } catch (error) {
//         console.error(`[User Service - changeUserPassword] Error during password change for ${userId}:`, error.message);
//         // Re-throw specific errors or a generic one
//         if (error.message.includes('Incorrect current password') || error.message.includes('New password cannot be the same') || error.message.includes('User not found')) {
//              throw error;
//         }
//         if (error.name === 'ValidationError') { // Catch Mongoose validation errors (e.g., password too short)
//              console.log("[User Service - changeUserPassword] Validation error during password save:", error.errors);
//              const messages = Object.values(error.errors).map(el => el.message);
//              throw new Error(`Password update validation failed: ${messages.join(', ')}`);
//          }
//         throw new Error('Failed to change password due to a server error.');
//     }
// };
// export default {
//     getAllUsers,
//     getUserById,
//     getUserByIdWithKyc, 
//     changeUserPassword,
// };


// // backend/src/services/user.service.js
// import User from '../models/User.js';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// // --- getAllUsers (No changes) ---
// const getAllUsers = async () => {
//     try {
//         return await User.find().select('-password'); // Standard select is fine here if not using .lean()
//     } catch (error) {
//         console.error("Error in getAllUsers service:", error);
//         throw new Error("Failed to fetch users.");
//     }
// };

// // --- getUserById (No changes) ---
// const getUserById = async (userId) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//              throw new Error('Invalid user ID format.');
//         }
//         const user = await User.findById(userId).select('-password'); // Exclude password explicitly if not using lean
//         if (!user) {
//             return null;
//         }
//         return user; // Returns Mongoose document which respects toJSON/toObject transforms
//     } catch (error) {
//         console.error(`Error in getUserById service for ${userId}:`, error);
//          if (error.message.includes('Invalid user ID format')) {
//              throw error;
//          }
//         throw new Error("Failed to fetch user.");
//     }
// };

// // --- getUserByIdWithKyc (MODIFIED: Removed problematic .select() when using .lean()) ---
// const getUserByIdWithKyc = async (userId) => {
//     console.log(`[User Service] Attempting to fetch details with KYC for user ID: ${userId}`);
//     try {
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             throw new Error('Invalid user ID format.');
//         }

//         // --- MODIFICATION START ---
//         // Remove the conflicting .select() call.
//         // .lean() will fetch fields *without* 'select: false' in the schema.
//         // Sensitive fields like 'password', 'googleId', 'resetPasswordToken'
//         // (which have select: false) will be omitted by default from the lean object.
//         const user = await User.findById(userId)
//             //.select('-password -resetPasswordToken -resetPasswordExpires -__v +isGoogleAccount') // REMOVED THIS LINE
//             .lean(); // Use lean to get a plain JS object
//         // --- MODIFICATION END ---

//         if (!user) {
//              console.warn(`[User Service] User not found for ID: ${userId}`);
//             // Throw specific error that controller can catch
//             throw new Error('User not found.');
//         }

//         // Ensure default KYC object if missing (important with lean())
//         // Check if kyc field exists and is an object. lean() might return undefined if the field doesn't exist in the doc.
//         if (!user.kyc || typeof user.kyc !== 'object') {
//             console.warn(`[User Service] User ${userId} missing/invalid 'kyc' object in lean result. Providing default.`);
//             // Manually add the default structure
//              user.kyc = {
//                 status: 'not_started',
//                 firstName: user.fullName?.split(' ')[0] || '',
//                 lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
//                 dateOfBirth: null, mobile: null, occupation: null, salaryRange: null,
//                 nationality: null, idType: null, idNumber: null, idIssueDate: null,
//                 idExpiryDate: null, documents: [], submittedAt: null, verifiedAt: null,
//                 rejectedAt: null, rejectionReason: null, lastUpdatedAt: null,
//              };
//         } else if (typeof user.kyc.status !== 'string') {
//              // Ensure status exists if kyc object exists but status is missing
//             console.warn(`[User Service] User ${userId} kyc object missing status. Setting default.`);
//             user.kyc.status = 'not_started';
//         }

//         // isGoogleAccount should be included by default in lean() if it doesn't have select:false
//         console.log(`[User Service] Successfully fetched user details for ID: ${userId}, IsGoogle: ${user.isGoogleAccount}`);
//         return user; // Return the plain JS user object (including kyc)

//     } catch (error) {
//         console.error(`[User Service] Error fetching user details for ${userId}:`, error.message);
//          // Re-throw specific errors or a generic one
//          if (error.message.includes('Invalid user ID format') || error.message === 'User not found.') {
//             throw error;
//          }
//          // The original projection error should now be gone, but catch others
//         throw new Error('Failed to fetch user details.'); // Generic fallback
//     }
// };

// // --- changeUserPassword (Modified: Add Google Account Check) ---
// const changeUserPassword = async (userId, currentPassword, newPassword) => {
//     console.log(`[User Service - changeUserPassword] Attempting password change for user ID: ${userId}`);

//     if (!userId || !currentPassword || !newPassword) {
//         throw new Error('Missing required fields for password change.');
//     }
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('Invalid user ID format.');
//     }
//     if (newPassword.length < 8) {
//          throw new Error('New password must be at least 8 characters long.');
//     }

//     try {
//         // Fetch the user, including password and Google flags
//         const user = await User.findById(userId).select('+password +isGoogleAccount +googleId');

//         if (!user) {
//             console.error(`[User Service - changeUserPassword] User not found: ${userId}`);
//             throw new Error('User not found.');
//         }

//         // Prevent password change for Google accounts
//         if (user.isGoogleAccount || user.googleId) {
//             console.warn(`[User Service - changeUserPassword] Attempt to change password for Google account ${userId}. Denied.`);
//             // Specific user-facing error
//             throw new Error('Password changes are not available for accounts managed by Google Sign-In.');
//         }

//         // Verify the current password (only for non-Google accounts)
//         // Ensure user.password exists before comparing
//         if(!user.password) {
//              console.error(`[User Service - changeUserPassword] Password field missing for non-Google user ${userId} during change attempt.`);
//              throw new Error('Cannot verify current password. Account data inconsistent.');
//         }
//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             console.log(`[User Service - changeUserPassword] Incorrect current password for user: ${userId}`);
//             throw new Error('Incorrect current password.');
//         }

//         if (currentPassword === newPassword) {
//              console.log(`[User Service - changeUserPassword] New password is the same as the current one for user: ${userId}`);
//              throw new Error('New password cannot be the same as the current one.');
//         }

//         // Assign new password (pre-save hook will hash it)
//         user.password = newPassword;
//         await user.save(); // Trigger pre-save hook and save changes

//         console.log(`[User Service - changeUserPassword] Password successfully updated for user: ${userId}`);

//     } catch (error) {
//         console.error(`[User Service - changeUserPassword] Error during password change for ${userId}:`, error.message);
//         // Re-throw specific errors including the new Google check
//         if (error.message.includes('Incorrect current password') ||
//             error.message.includes('New password cannot be the same') ||
//             error.message.includes('User not found') ||
//             error.message.includes('not available for accounts managed by Google Sign-In') ||
//             error.message.includes('Account data inconsistent') ) {
//              throw error;
//         }
//         if (error.name === 'ValidationError') {
//              console.log("[User Service - changeUserPassword] Validation error during password save:", error.errors);
//              const messages = Object.values(error.errors).map(el => el.message);
//              throw new Error(`Password update validation failed: ${messages.join(', ')}`);
//          }
//         throw new Error('Failed to change password due to a server error.');
//     }
// };

// export default {
//     getAllUsers,
//     getUserById,
//     getUserByIdWithKyc, // Modified function
//     changeUserPassword,
// };


// backend/src/services/user.service.js
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- getAllUsers (No changes) ---
const getAllUsers = async () => {
    try {
        return await User.find().select('-password'); 
    } catch (error) {
        console.error("Error in getAllUsers service:", error);
        throw new Error("Failed to fetch users.");
    }
};

// --- getUserById (No changes) ---
const getUserById = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
             throw new Error('Invalid user ID format.');
        }
        const user = await User.findById(userId).select('-password'); 
        if (!user) {
            return null;
        }
        return user; 
    } catch (error) {
        console.error(`Error in getUserById service for ${userId}:`, error);
         if (error.message.includes('Invalid user ID format')) {
             throw error;
         }
        throw new Error("Failed to fetch user.");
    }
};

// --- getUserByIdWithKyc (No changes from previous corrected version) ---
const getUserByIdWithKyc = async (userId) => {
    console.log(`[User Service] Attempting to fetch details with KYC for user ID: ${userId}`);
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format.');
        }
        const user = await User.findById(userId).lean(); 

        if (!user) {
             console.warn(`[User Service] User not found for ID: ${userId}`);
            throw new Error('User not found.');
        }
        if (!user.kyc || typeof user.kyc !== 'object') {
            console.warn(`[User Service] User ${userId} missing/invalid 'kyc' object in lean result. Providing default.`);
             user.kyc = {
                status: 'not_started',
                firstName: user.fullName?.split(' ')[0] || '',
                lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
                dateOfBirth: null, mobile: null, occupation: null, salaryRange: null,
                nationality: null, idType: null, idNumber: null, idIssueDate: null,
                idExpiryDate: null, documents: [], submittedAt: null, verifiedAt: null,
                rejectedAt: null, rejectionReason: null, lastUpdatedAt: null,
             };
        } else if (typeof user.kyc.status !== 'string') {
            console.warn(`[User Service] User ${userId} kyc object missing status. Setting default.`);
            user.kyc.status = 'not_started';
        }
        console.log(`[User Service] Successfully fetched user details for ID: ${userId}, IsGoogle: ${user.isGoogleAccount}`);
        return user; 

    } catch (error) {
        console.error(`[User Service] Error fetching user details for ${userId}:`, error.message);
         if (error.message.includes('Invalid user ID format') || error.message === 'User not found.') {
            throw error;
         }
        throw new Error('Failed to fetch user details.'); 
    }
};

// --- changeUserPassword (REMOVED Google Account Check) ---
const changeUserPassword = async (userId, currentPassword, newPassword) => {
    console.log(`[User Service - changeUserPassword] Attempting password change for user ID: ${userId}`);

    if (!userId || !currentPassword || !newPassword) {
        throw new Error('Missing required fields for password change.');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format.');
    }
    if (newPassword.length < 8) {
         throw new Error('New password must be at least 8 characters long.');
    }

    try {
        const user = await User.findById(userId).select('+password +isGoogleAccount +googleId');

        if (!user) {
            console.error(`[User Service - changeUserPassword] User not found: ${userId}`);
            throw new Error('User not found.');
        }

        // --- REMOVED: Prevent password change for Google accounts ---
        // Users (including Google-linked ones) can change their password if they have one set
        // and provide the correct current password.
        // --- END REMOVAL ---

        if(!user.password) {
             console.error(`[User Service - changeUserPassword] Password field missing for user ${userId} during change attempt. User may need to use 'Forgot Password' to set one first.`);
             // This implies the user (likely a Google user who hasn't set a password via forgot password)
             // is trying to change a non-existent password.
             throw new Error('Incorrect current password.'); // Treat as if current password was wrong
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log(`[User Service - changeUserPassword] Incorrect current password for user: ${userId}`);
            throw new Error('Incorrect current password.');
        }

        if (await bcrypt.compare(newPassword, user.password)) { // Compare new with current hashed password
             console.log(`[User Service - changeUserPassword] New password is the same as the current one for user: ${userId}`);
             throw new Error('New password cannot be the same as the current one.');
        }

        user.password = newPassword;
        await user.save(); 

        console.log(`[User Service - changeUserPassword] Password successfully updated for user: ${userId}`);

    } catch (error) {
        console.error(`[User Service - changeUserPassword] Error during password change for ${userId}:`, error.message);
        if (error.message.includes('Incorrect current password') ||
            error.message.includes('New password cannot be the same') ||
            error.message.includes('User not found') ||
            error.message.includes('Account data inconsistent') ) {
             throw error;
        }
        if (error.name === 'ValidationError') {
             console.log("[User Service - changeUserPassword] Validation error during password save:", error.errors);
             const messages = Object.values(error.errors).map(el => el.message);
             throw new Error(`Password update validation failed: ${messages.join(', ')}`);
         }
        throw new Error('Failed to change password due to a server error.');
    }
};

export default {
    getAllUsers,
    getUserById,
    getUserByIdWithKyc, 
    changeUserPassword,
};