// import express from 'express';
// import authController from '../controllers/auth.controller.js';
// import authValidators from '../validators/auth.validators.js';

// const router = express.Router();

// // POST /api/auth/register - Register a new user (public route)
// router.post('/register', authValidators.validateRegister, authController.register); // Apply validation middleware before controller

// // POST /api/auth/login - Login user and get JWT token (public route)
// router.post('/login', authValidators.validateLogin, authController.login); // Apply validation middleware

// export default router;


// // routes > auth.routes.js
// import express from 'express';
// import authController from '../controllers/auth.controller.js';
// import authValidators from '../validators/auth.validators.js';

// const router = express.Router();

// router.post('/register', authValidators.validateRegister, authController.register);
// router.post('/login', authValidators.validateLogin, authController.login);
// router.post('/forgot-password', authValidators.validateForgotPassword, authController.forgotPassword); // Use validator
// router.post('/reset-password', authValidators.validateResetPassword, authController.resetPassword);   // Use validator


// export default router;


// // routes > auth.routes.js
// import express from 'express';
// import authController from '../controllers/auth.controller.js';
// import authValidators from '../validators/auth.validators.js';

// const router = express.Router();

// router.post('/register', authValidators.validateRegister, authController.register);
// router.post('/login', authValidators.validateLogin, authController.login);
// router.post('/forgot-password', authValidators.validateForgotPassword, authController.forgotPassword); // Use validator
// router.post('/reset-password', authValidators.validateResetPassword, authController.resetPassword);   // Use validator


// export default router;

// // routes/auth.routes.js
// import express from 'express';
// import authController from '../controllers/auth.controller.js';
// import authValidators from '../validators/auth.validators.js';

// const router = express.Router();

// // --- Standard Auth Routes ---
// router.post('/register', authValidators.validateRegister, authController.register);
// router.post('/login', authValidators.validateLogin, authController.login);
// router.post('/forgot-password', authValidators.validateForgotPassword, authController.forgotPassword);
// router.post('/reset-password', authValidators.validateResetPassword, authController.resetPassword);

// // --- Google OAuth Routes ---
// router.get('/google', authController.googleAuthInitiate);         // Step 1: User clicks button, frontend navigates here, backend redirects to Google
// router.get('/google/callback', authController.googleAuthCallback); // Step 2: Google redirects here, backend processes, redirects to frontend handler

// export default router;


import express from 'express';
import authController from '../controllers/auth.controller.js';
import authValidators from '../validators/auth.validators.js';

const router = express.Router();

// --- Standard Auth Routes ---
router.post('/register', authValidators.validateRegister, authController.register);
router.post('/verify-otp', authValidators.validateVerifyOtp, authController.verifyOtp);
router.post('/resend-otp', authValidators.validateResendOtp, authController.resendOtp); // ADDED
router.post('/login', authValidators.validateLogin, authController.login);
router.post('/forgot-password', authValidators.validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', authValidators.validateResetPassword, authController.resetPassword);

// --- Google OAuth Routes ---
router.get('/google', authController.googleAuthInitiate);
router.get('/google/callback', authController.googleAuthCallback);

export default router;