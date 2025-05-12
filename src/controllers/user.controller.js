// import userService from '../services/user.service.js';

// const getAllUsers = async (req, res, next) => { // Add 'next' for error handling
//     try {
//         const users = await userService.getAllUsers();
//         res.json(users);
//     } catch (error) {
//         next(error); // Pass errors to error handling middleware
//     }
// };

// const getUserById = async (req, res, next) => { // Add 'next' for error handling
//     try {
//         const user = await userService.getUserById(req.params.userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' }); // 404 Not Found if user not found
//         }
//         res.json(user);
//     } catch (error) {
//         next(error); // Pass errors to error handling middleware
//     }
// };
// const getMe = async (req, res, next) => {
//     try {
//         // req.user is populated by authMiddleware.protect
//         if (!req.user || !req.user._id) {
//             return res.status(401).json({ message: 'Not authorized, user not found in token' });
//         }

//         // Use a service function to get the user, ensuring KYC is selected
//         const user = await userService.getUserByIdWithKyc(req.user._id); // Need to create this service function

//         if (!user) {
//             // Should not happen if token is valid, but good practice
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Return the user object (toJSON in model handles password removal)
//         res.status(200).json({ user }); // Often wrapped in a 'user' key

//     } catch (error) {
//         next(error);
//     }
// };
// export default {
//     getMe, // Export the new method
//     getAllUsers,
//     getUserById,
// };


// // backend/src/controllers/user.controller.js
// import userService from '../services/user.service.js';

// const getAllUsers = async (req, res, next) => {
//     try {
//         // TODO: Add admin check here if only admins should get all users
//         // if (req.user.role !== 'admin') {
//         //     return res.status(403).json({ message: 'Not authorized' });
//         // }
//         const users = await userService.getAllUsers();
//         res.json(users);
//     } catch (error) {
//         next(error);
//     }
// };

// const getUserById = async (req, res, next) => {
//     try {
//         // TODO: Add checks - can the logged-in user view this profile? (e.g., is it their own, or are they admin?)
//         const user = await userService.getUserById(req.params.userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user); // Default toJSON removes password
//     } catch (error) {
//         next(error);
//     }
// };

// // --- Controller for GET /api/dashboard/users/me ---
// const getMe = async (req, res, next) => {
//     try {
//         // req.user is populated by authMiddleware.protect
//         if (!req.user?._id) {
//             // This shouldn't happen if protect middleware ran successfully
//             return res.status(401).json({ message: 'Not authorized, user token invalid or missing' });
//         }

//         // Use the service function that explicitly includes KYC details
//         // Pass the user ID from the authenticated request
//         const userWithDetails = await userService.getUserByIdWithKyc(req.user._id);

//         if (!userWithDetails) {
//             // Should not happen if token is valid and user exists, but good practice
//             console.warn(`User with valid token but not found in DB: ${req.user._id}`);
//             return res.status(404).json({ message: 'User associated with token not found' });
//         }

//         // Return the user object (toJSON in the model handles password removal)
//         // Wrapping in a 'user' key is common practice but optional
//         res.status(200).json(userWithDetails); // Send the full user object

//     } catch (error) {
//         console.error("Error in getMe controller:", error);
//         next(error); // Pass to global error handler
//     }
// };
// // --- End Controller ---


// // --- Controller for PUT /api/dashboard/users/me/password ---
// const changePassword = async (req, res, next) => {
//     try {
//         // User ID comes from the authenticated request (set by authMiddleware.protect)
//         const userId = req.user?._id;
//         if (!userId) {
//             // Should not happen if auth middleware is working
//             return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
//         }

//         const { currentPassword, newPassword } = req.body;

//         // Basic check for required fields (validator should handle more)
//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({ message: 'Current password and new password are required.' });
//         }

//         // Call the service function
//         await userService.changeUserPassword(userId, currentPassword, newPassword);

//         // Send success response
//         res.status(200).json({ message: 'Password changed successfully.' }); // Or 204 No Content if preferred

//     } catch (error) {
//         console.error("Error in changePassword controller:", error.message);

//         // Handle specific errors from the service
//         if (error.message === 'Incorrect current password.') {
//             // 401 Unauthorized or 400 Bad Request are possibilities. 400 might be better as it's user input error.
//             return res.status(400).json({ message: error.message });
//         }
//         if (error.message === 'New password cannot be the same as the current one.') {
//             return res.status(400).json({ message: error.message });
//         }
//         if (error.message.includes('validation failed')) { // Catch validation errors from service/model
//              return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('User not found')) { // Should be rare
//              return res.status(404).json({ message: 'User not found.' });
//          }
//         if (error.message.includes('Invalid user ID format') || error.message.includes('Missing required fields')) {
//              return res.status(400).json({ message: 'Invalid request data.' });
//          }

//         // Pass other errors to the global error handler
//         next(new Error('Failed to change password. Please try again.')); // Generic message for other errors
//     }
// };


// export default {
//     getMe, // Export the new method
//     getAllUsers,
//     getUserById,
//     changePassword,
// };


// // backend/src/controllers/user.controller.js
// import userService from '../services/user.service.js';

// // --- getMe (No changes needed) ---
// const getMe = async (req, res, next) => {
//     try {
//         if (!req.user?._id) {
//             return res.status(401).json({ message: 'Not authorized, user token invalid or missing' });
//         }
//         const userWithDetails = await userService.getUserByIdWithKyc(req.user._id);
//         if (!userWithDetails) {
//             console.warn(`User with valid token but not found in DB: ${req.user._id}`);
//             return res.status(404).json({ message: 'User associated with token not found' });
//         }
//         res.status(200).json(userWithDetails);
//     } catch (error) {
//         console.error("Error in getMe controller:", error);
//         next(error);
//     }
// };

// // --- getAllUsers (No changes needed) ---
// const getAllUsers = async (req, res, next) => {
//     try {
//         // Optional: Add admin check if needed
//         // if (req.user.role !== 'admin') { return res.status(403).json({ message: 'Not authorized' }); }
//         const users = await userService.getAllUsers();
//         res.json(users);
//     } catch (error) {
//         next(error);
//     }
// };

// // --- getUserById (No changes needed) ---
// const getUserById = async (req, res, next) => {
//     try {
//         const user = await userService.getUserById(req.params.userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (error) {
//         next(error);
//     }
// };


// // --- changePassword Controller (Handles new Google error) ---
// const changePassword = async (req, res, next) => {
//     try {
//         const userId = req.user?._id;
//         if (!userId) {
//             return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
//         }
//         const { currentPassword, newPassword } = req.body;

//         // Basic check (validator handles more)
//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({ message: 'Current password and new password are required.' });
//         }

//         // Call the service function (which now checks for Google accounts)
//         await userService.changeUserPassword(userId, currentPassword, newPassword);

//         res.status(200).json({ message: 'Password changed successfully.' });

//     } catch (error) {
//         console.error("Error in changePassword controller:", error.message);

//         // --- MODIFIED: Handle specific Google account error ---
//         if (error.message.includes('not available for accounts managed by Google Sign-In')) {
//              return res.status(400).json({ message: error.message });
//         }
//         // --- END MODIFICATION ---

//         if (error.message === 'Incorrect current password.') {
//             return res.status(400).json({ message: error.message });
//         }
//         if (error.message === 'New password cannot be the same as the current one.') {
//             return res.status(400).json({ message: error.message });
//         }
//         if (error.message.includes('validation failed')) {
//              return res.status(400).json({ message: error.message });
//         }
//          if (error.message.includes('User not found')) {
//              return res.status(404).json({ message: 'User not found.' });
//          }
//         if (error.message.includes('Invalid user ID format') || error.message.includes('Missing required fields')) {
//              return res.status(400).json({ message: 'Invalid request data.' });
//          }

//         // Generic error handler
//         next(new Error('Failed to change password. Please try again.'));
//     }
// };


// export default {
//     getMe,
//     getAllUsers,
//     getUserById,
//     changePassword,
// };

// backend/src/controllers/user.controller.js
import userService from '../services/user.service.js';

// --- getMe (No changes needed) ---
const getMe = async (req, res, next) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Not authorized, user token invalid or missing' });
        }
        const userWithDetails = await userService.getUserByIdWithKyc(req.user._id);
        if (!userWithDetails) {
            console.warn(`User with valid token but not found in DB: ${req.user._id}`);
            return res.status(404).json({ message: 'User associated with token not found' });
        }
        res.status(200).json(userWithDetails);
    } catch (error) {
        console.error("Error in getMe controller:", error);
        next(error);
    }
};

// --- getAllUsers (No changes needed) ---
const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// --- getUserById (No changes needed) ---
const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};


// --- changePassword Controller (REMOVED Google error check) ---
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
        }
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required.' });
        }

        await userService.changeUserPassword(userId, currentPassword, newPassword);

        res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error) {
        console.error("Error in changePassword controller:", error.message);

        // --- REMOVED: Handle specific Google account error ---
        // The service layer will no longer throw this specific error.
        // --- END REMOVAL ---

        if (error.message === 'Incorrect current password.') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'New password cannot be the same as the current one.') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('validation failed')) {
             return res.status(400).json({ message: error.message });
        }
         if (error.message.includes('User not found')) {
             return res.status(404).json({ message: 'User not found.' });
         }
        if (error.message.includes('Invalid user ID format') || error.message.includes('Missing required fields')) {
             return res.status(400).json({ message: 'Invalid request data.' });
         }
        next(new Error('Failed to change password. Please try again.'));
    }
};


export default {
    getMe,
    getAllUsers,
    getUserById,
    changePassword,
};