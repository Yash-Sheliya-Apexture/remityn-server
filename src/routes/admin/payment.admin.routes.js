import express from 'express';
import paymentAdminController from '../../controllers/admin/payment.admin.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// Get all payments (Admin only)
router.get('/', authMiddleware.protect, authMiddleware.admin, paymentAdminController.getAllPaymentsAdmin);

// Get payment by ID (Admin only) - Optional for now, but good to have
router.get('/:paymentId', authMiddleware.protect, authMiddleware.admin, paymentAdminController.getPaymentByIdAdmin);

// Update payment status (Admin only)
router.put('/:paymentId', authMiddleware.protect, authMiddleware.admin, paymentAdminController.updatePaymentStatusAdmin);
export default router;