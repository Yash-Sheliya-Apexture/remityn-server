// import adminUserService from '../../services/admin/user.admin.service.js';

// const getAllUsersAdmin = async (req, res, next) => {
//     try {
//         const users = await adminUserService.getAllUsersAdmin();
//         res.json(users);
//     } catch (error) {
//         next(error);
//     }
// };

// export default {
//     getAllUsersAdmin,
// };



// backend/controllers/admin/user.admin.controller.js
import adminUserService from '../../services/admin/user.admin.service.js';
import AppError from '../../utils/AppError.js'; // Assuming you have a custom error class

// Controller to get all users for the admin list
const getAllUsersAdmin = async (req, res, next) => {
    try {
        // Service fetches users with limited fields suitable for the list view
        const users = await adminUserService.getAllUsersAdmin();
        res.status(200).json({
             success: true,
             count: users.length,
             data: users // Send data wrapped, or directly as array based on your convention
        });
    } catch (error) {
        next(error); // Pass errors to the global error handler
    }
};


// --- >>> ADD THIS CONTROLLER FUNCTION <<< ---
// Controller to get detailed information for a specific user
const getUserDetailsAdmin = async (req, res, next) => {
    try {
        const userId = req.params.userId; // Get userId from route parameter

        if (!userId) {
            // Basic validation, though service layer might also check format
            return next(new AppError('User ID is required in the URL path.', 400));
        }

        // Call the service function to fetch comprehensive details
        const userDetails = await adminUserService.getUserDetailsAdmin(userId);

        // Service will throw an error if user not found, handled by catch block/global handler

        res.status(200).json(userDetails); // Send the detailed user object

    } catch (error) {
         // Let the global error handler manage sending the response for errors
         // It should handle the 'User not found' error from the service and return 404
         next(error);
    }
};
// --- >>> END OF ADDED CONTROLLER FUNCTION <<< ---


export default {
    getAllUsersAdmin,
    getUserDetailsAdmin, // <-- Make sure to export the new function
    // Export other admin user controller functions here
};