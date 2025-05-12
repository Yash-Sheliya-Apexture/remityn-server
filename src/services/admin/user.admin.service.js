// import User from '../../models/User.js';

// const getAllUsersAdmin = async () => {
//     try {
//         return await User.find().select('-password'); // Exclude password field from admin user list for security
//     } catch (error) {
//         // Log the error for debugging and monitoring - important for production
//         console.error("Error in getAllUsersAdmin service:", error);
//         throw new Error("Failed to fetch users for admin."); // Re-throw a generic error for controller to handle
//     }
// };

// export default {
//     getAllUsersAdmin,
// };


// backend/services/admin/user.admin.service.js
import mongoose from 'mongoose';
import User from '../../models/User.js';
import Account from '../../models/Account.js'; // Import Account model
import Transfer from '../../models/Transfer.js'; // Import Transfer model
import Payment from '../../models/Payment.js'; // Import Payment model (for add money)
import AppError from '../../utils/AppError.js'; // Assuming custom error class

// Service to get limited user data for the admin list page
const getAllUsersAdmin = async () => {
    try {
        // Select only fields needed for the list view + sorting/filtering fields
        // Crucially include fields needed by UserTable: kyc.status, kyc.dateOfBirth, kyc.mobile
        return await User.find()
            .select('fullName email createdAt kyc.status kyc.dateOfBirth kyc.mobile')
            .lean(); // Use .lean() for better performance when just reading data
    } catch (error) {
        console.error("Error in getAllUsersAdmin service:", error);
        // Don't throw AppError here, let controller handle generic error
        throw new Error("Failed to fetch users for admin list.");
    }
};


// --- >>> ADD THIS SERVICE FUNCTION <<< ---
// Service to get comprehensive details for a specific user by ID
const getUserDetailsAdmin = async (userId) => {
    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid User ID format.', 400); // Bad Request
    }

    try {
        // 2. Fetch Core User Data (excluding password)
        // Use lean() for the main user doc if you don't need Mongoose methods on it later
        const user = await User.findById(userId).select('-password').lean();

        // 3. Handle User Not Found
        if (!user) {
            throw new AppError('User not found.', 404); // Not Found
        }

        // 4. Fetch Related Data in Parallel (more efficient)
        const [accounts, transfers, payments] = await Promise.all([
            Account.find({ user: userId }).populate('currency').lean(), // Populate currency details
            Transfer.find({ user: userId }) // Find transfers WHERE THIS USER is the sender
                   .populate('sendCurrency receiveCurrency recipient') // Populate relevant fields
                   .sort({ createdAt: -1 }) // Get most recent first
                   .limit(20) // Limit results for performance
                   .lean(),
            Payment.find({ user: userId }) // Find 'add money' payments initiated BY THIS USER
                   .populate('payInCurrency') // Populate payment currency
                   .sort({ createdAt: -1 }) // Get most recent first
                   .limit(20) // Limit results for performance
                   .lean()
        ]);

        // 5. Combine and Return Data (Matches AdminUserDetailResponse structure)
        // Ensure arrays are returned even if no related data found
        return {
            ...user, // Spread the core user data (already excludes password)
            accounts: accounts || [],
            transfers: transfers || [],
            payments: payments || [], // This represents the "add money" transactions
             // The 'kyc' subdocument is already included in the 'user' object fetched earlier
        };

    } catch (error) {
        // Log the detailed error on the server
        console.error(`Error fetching details for user ${userId} in service:`, error);

        // Re-throw specific AppErrors or a generic one
        if (error instanceof AppError) {
            throw error; // Preserve status code (like 404)
        }
        // Throw a generic server error for unexpected issues
        throw new AppError('Failed to fetch user details due to a server error.', 500);
    }
};
// --- >>> END OF ADDED SERVICE FUNCTION <<< ---


export default {
    getAllUsersAdmin,
    getUserDetailsAdmin, // <-- Make sure to export the new function
    // Export other admin user service functions here
};