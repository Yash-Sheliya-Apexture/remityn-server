// backend/src/routes/account.routes.js
import express from 'express';
import accountController from '../controllers/account.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all accounts for the logged-in user
router.get('/', authMiddleware.protect, accountController.getUserAccounts);

// Add a new currency account for the logged-in user
router.post('/', authMiddleware.protect, accountController.addCurrencyAccount);

// Get account details by account ID (balanceId)
router.get('/:balanceId', authMiddleware.protect, accountController.getAccountById);

export default router;