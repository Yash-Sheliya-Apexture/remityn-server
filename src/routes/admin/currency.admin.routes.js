

import express from 'express';
import currencyAdminController from '../../controllers/admin/currency.admin.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// Get all currencies (Admin only)
router.get('/', authMiddleware.protect, authMiddleware.admin, currencyAdminController.getAllCurrenciesAdmin);

// Get currency by ID (Admin only)
router.get('/:currencyId', authMiddleware.protect, authMiddleware.admin, currencyAdminController.getCurrencyByIdAdmin);

// Create a new currency (Admin only)
router.post('/', authMiddleware.protect, authMiddleware.admin, currencyAdminController.createCurrencyAdmin);

// Update an existing currency (Admin only)
router.put('/:currencyId', authMiddleware.protect, authMiddleware.admin, currencyAdminController.updateCurrencyAdmin);

// Delete a currency (Admin only)
router.delete('/:currencyId', authMiddleware.protect, authMiddleware.admin, currencyAdminController.deleteCurrencyAdmin);

export default router;