// import express from 'express';
// import userController from '../controllers/user.controller.js';

// const router = express.Router();

// // --- Add this route ---
// // GET /api/dashboard/users/me - Get current logged-in user's details (including KYC)
// router.get('/me', userController.getMe);
// // --- End Add route ---

// // GET /api/dashboard/users - Get all users (protected route, accessible to logged-in users - adjust access control as needed)
// router.get('/', userController.getAllUsers); // Protected at the server.js level - authMiddleware.protect is applied to /api/dashboard/users in server.js
// // GET /api/dashboard/users/:userId - Get user by ID (protected route)
// router.get('/:userId', userController.getUserById); // Protected at the server.js level

// // Add more user routes here (e.g., update profile, etc.) - remember to protect them with authMiddleware.protect as needed

// export default router;


// backend/src/routes/user.routes.js
import express from 'express';
import userController from '../controllers/user.controller.js';
import userValidators from '../validators/user.validators.js'; // Import user validators
// Note: authMiddleware.protect is applied globally in server.js for /api/dashboard/users

const router = express.Router();

// GET /api/dashboard/users/me - Get current logged-in user's details
router.get('/me', userController.getMe);

// --- Add this route for changing password ---
// PUT /api/dashboard/users/me/password - Change the current user's password
router.put(
    '/me/password',
    userValidators.validateChangePassword, // Apply validation middleware first
    userController.changePassword       // Then call the controller
);
// --- End Add route ---

// GET /api/dashboard/users - Get all users (Admin check might be needed in controller/service)
router.get('/', userController.getAllUsers);

// GET /api/dashboard/users/:userId - Get user by ID (Access control might be needed)
router.get('/:userId', userController.getUserById);

export default router;