// backend/src/validators/user.admin.validators.js

import validator from 'validator'; // Import validator library
import AppError from '../../utils/AppError.js'; // Import custom error class

/**
 * Middleware to validate the 'userId' parameter in the request URL.
 * Checks if it exists and is a valid MongoDB ObjectId format.
 */
const validateUserIdParam = (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return next(new AppError('User ID parameter is missing in the URL.', 400));
    }

    if (!validator.isMongoId(userId)) {
        return next(new AppError('Invalid User ID format provided in the URL.', 400));
    }
    next();
};

/**
 * Validation middleware specifically for the GET /admin/users/:userId route.
 * Currently, it only needs the userId parameter validation.
 */
const validateGetUserById = [
    validateUserIdParam, // Apply the parameter validation middleware
    // No further validation needed for this specific route, controller handles 'not found'
];

/**
 * Placeholder Validation middleware for the PUT /admin/users/:userId route (if implemented).
 * Validates the userId parameter and fields in the request body.
 */
const validateUpdateUser = (req, res, next) => {
    // --- 1. Validate Path Parameter ---
    const { userId } = req.params;
    if (!userId || !validator.isMongoId(userId)) {
        return next(new AppError('Invalid or missing User ID parameter in the URL.', 400));
    }

    // --- 2. Validate Request Body Fields (Example) ---
    const { email, fullName, role } = req.body;
    const errors = [];

    // Email Validation (if present)
    if (email !== undefined) {
        if (typeof email !== 'string' || !validator.isEmail(email)) {
            errors.push({ field: 'email', message: 'Invalid email format provided.' });
        } else {
            // Sanitize email (modifies req.body)
            req.body.email = validator.normalizeEmail(email);
        }
    }

    // Full Name Validation (if present)
    if (fullName !== undefined) {
         // Trim the input first (modifies req.body)
         if(typeof fullName === 'string') req.body.fullName = validator.trim(fullName);

        if (typeof req.body.fullName !== 'string' || validator.isEmpty(req.body.fullName)) {
            errors.push({ field: 'fullName', message: 'Full name cannot be empty if provided.' });
        } else if (!validator.isLength(req.body.fullName, { min: 2, max: 100 })) {
            errors.push({ field: 'fullName', message: 'Full name must be between 2 and 100 characters.' });
        }
    }

    // Role Validation (if present)
    if (role !== undefined) {
        if (!validator.isIn(role, ['user', 'admin'])) {
            errors.push({ field: 'role', message: 'Invalid role specified. Must be "user" or "admin".' });
        }
    }

    // Add checks for other fields as needed...

    // --- 3. Handle Validation Results ---
    if (errors.length > 0) {
        // Log errors for debugging
        console.error("Admin Update User Validation Errors:", errors);
        // Send a 400 response with the collected errors
        // It's better to use AppError to let the global handler format it,
        // but sending directly is also an option.
        // Option 1: Use AppError
         return next(new AppError('Validation failed.', 400, errors)); // Pass errors optionally
        // Option 2: Send response directly
        // return res.status(400).json({ message: 'Validation failed.', errors });
    }

    // All validations passed
    next();
};


/**
 * Placeholder Validation middleware for the DELETE /admin/users/:userId route (if implemented).
 * Primarily requires validating the userId parameter.
 */
const validateDeleteUser = [
    validateUserIdParam, // Apply the parameter validation middleware
    // No further specific body validation needed for delete usually
];


// Export the middleware functions
export default {
    validateUserIdParam,
    validateGetUserById,
    validateUpdateUser, // Export placeholder
    validateDeleteUser, // Export placeholder
};

// --- How to use in routes (example for GET /:userId) ---
/*
import userAdminValidators from '../../validators/user.admin.validators.js';
import userAdminController from '../../controllers/user.admin.controller.js';

router.get(
    '/:userId',
    userAdminValidators.validateGetUserById, // This is now an array containing the middleware
    userAdminController.getUserDetailsAdmin
);

// Example for POST /:userId/inbox (only needs param validation here, body validation done separately)
import inboxAdminRoutes from './inbox.admin.routes.js';
router.use(
    '/:userId/inbox',
    userAdminValidators.validateUserIdParam, // Validate param before sub-router
    inboxAdminRoutes                       // Sub-router handles its own body validation
);

// Example for PUT /:userId
router.put(
    '/:userId',
    userAdminValidators.validateUpdateUser, // This middleware handles both param and body
    userAdminController.updateUserAdmin // Assuming this controller exists
);
*/