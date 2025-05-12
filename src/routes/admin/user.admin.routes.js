// import express from 'express';
// import adminUserController from '../../controllers/admin/user.admin.controller.js';
// import authMiddleware from '../../middleware/auth.middleware.js';

// const router = express.Router();

// // GET /api/admin/users - Get all users (Admin only, protected route)
// router.get('/', authMiddleware.protect, authMiddleware.admin, adminUserController.getAllUsersAdmin); // Requires authentication and admin role

// // Add more admin user routes here (e.g., create, update, delete user by admin)

// export default router;

// import express from 'express';
// import adminUserController from '../../controllers/admin/user.admin.controller.js';
// import authMiddleware from '../../middleware/auth.middleware.js';

// const router = express.Router();

// // GET /api/admin/users - Get all users (Admin only, protected route)
// router.get('/', authMiddleware.protect, authMiddleware.admin, adminUserController.getAllUsersAdmin); // Requires authentication and admin role

// // Add more admin user routes here (e.g., create, update, delete user by admin)

// export default router;



// // backend/routes/admin/user.admin.routes.js
// import express from 'express';
// import adminUserController from '../../controllers/admin/user.admin.controller.js';
// import authMiddleware from '../../middleware/auth.middleware.js'; // Assuming middleware needed

// const router = express.Router();

// // --- Route for getting ALL users (You likely have this) ---
// router.get(
//     '/',
//     authMiddleware.protect,
//     authMiddleware.admin,
//     adminUserController.getAllUsersAdmin
// );

// // --- !!! CHECK THIS ROUTE !!! ---
// // Make sure you have a route like this to handle GET requests with an ID
// router.get(
//     '/:userId',         // <<< Does this route exist? Does it use :userId?
//     authMiddleware.protect,
//     authMiddleware.admin,
//     adminUserController.getUserDetailsAdmin // <<< Is this controller function defined and imported?
// );

// // Add more admin user routes here (e.g., update, delete user by admin)

// export default router;


// backend/src/routes/admin/user.admin.routes.js
import express from 'express';
import userAdminController from '../../controllers/admin/user.admin.controller.js';
import userAdminValidators from '../../validators/admin/user.admin.validators.js';
// --- REMOVE this import ---
// import inboxAdminRoutes from './inbox.admin.routes.js';
// --- ADD this import ---
import inboxAdminController from '../../controllers/admin/inbox.admin.controller.js'; // Import the inbox controller

const router = express.Router();

// --- Middleware for these routes is applied in server.js ---
// (authMiddleware.protect, authMiddleware.admin)

// GET /api/admin/users - Get all users for admin list
router.get('/', userAdminController.getAllUsersAdmin);

// GET /api/admin/users/:userId - Get specific user details for admin view
router.get('/:userId', userAdminValidators.validateGetUserById, userAdminController.getUserDetailsAdmin);

// --- CORRECTED Route for Sending an Inbox Message to a User ---
// Handles POST /api/admin/users/:userId/inbox
router.post('/:userId/inbox', inboxAdminController.sendMessageToUser); // Use the specific controller function

// --- REMOVE this line ---
// router.use('/:userId/inbox', inboxAdminRoutes); // <-- REMOVE THIS INCORRECT NESTING

// PUT /api/admin/users/:userId - Update user details (Example - add later if needed)
// router.put('/:userId', userAdminValidators.validateUpdateUser, userAdminController.updateUserAdmin);

// DELETE /api/admin/users/:userId - Delete a user (Example - add later if needed)
// router.delete('/:userId', userAdminValidators.validateDeleteUser, userAdminController.deleteUserAdmin);


export default router;