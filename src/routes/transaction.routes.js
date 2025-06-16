// backend/src/routes/transaction.routes.js
import express from 'express';
import transactionController from '../controllers/transaction.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all transaction routes
router.use(authMiddleware.protect);

// Calculate send summary
router.post('/calculate-summary', transactionController.calculateSummary);

// Initiate a new send transaction
router.post('/initiate', transactionController.initiateTransaction);

// Get list of user's transactions (add pagination/sorting later)
router.get('/', transactionController.listTransactions);

 // Get details of a specific transaction
 router.get('/:transactionId', transactionController.getTransaction);


export default router;