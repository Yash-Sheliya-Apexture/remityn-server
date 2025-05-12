// // backend/src/routes/payment.routes.js
// import express from 'express';
// import paymentController from '../controllers/payment.controller.js';
// import authMiddleware from '../middleware/auth.middleware.js';

// const router = express.Router();

// // Calculate payment summary (no save)
// router.post('/add-money/calculate-summary', authMiddleware.protect, paymentController.calculatePaymentSummary); // New route for calculation only

// // Initiate "Add Money" process (calculates and saves payment) - now for saving
// router.post('/add-money/initiate', authMiddleware.protect, paymentController.initiatePaymentAndSave); // Route for saving payment

// // Get payment details by payment ID
// router.get('/:paymentId', authMiddleware.protect, paymentController.getPaymentDetails);


// export default router;


import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Calculate payment summary (no save)
router.post('/add-money/calculate-summary', authMiddleware.protect, paymentController.calculatePaymentSummary); // New route for calculation only

// Initiate "Add Money" process (calculates and saves payment) - now for saving
router.post('/add-money/initiate', authMiddleware.protect, paymentController.initiatePaymentAndSave); // Route for saving payment

// Get payment details by payment ID
router.get('/:paymentId', authMiddleware.protect, paymentController.getPaymentDetails);

// Get all payments for the logged-in user
router.get('/', authMiddleware.protect, paymentController.getUserPayments); // <-- ADD THIS ROUTE

// Get payments for a specific balance currency for the logged-in user
router.get('/balance/:balanceCurrencyId', authMiddleware.protect, paymentController.getUserBalancePayments);

// Cancel a payment by payment ID - User can cancel their own payments
router.post('/:paymentId/cancel', authMiddleware.protect, paymentController.cancelPayment);


// NEW: Route for user confirming they've made the transfer
router.post('/:paymentId/confirm-transfer', authMiddleware.protect, paymentController.confirmUserTransfer);


export default router;