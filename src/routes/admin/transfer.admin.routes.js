// backend/src/routes/admin/transfer.admin.routes.js
import express from 'express';
import transferAdminController from '../../controllers/admin/transfer.admin.controller.js';
// Auth middleware will be applied at the mounting point in server.js

const router = express.Router();

// GET /api/admin/transfers - List all transfers (Admin only)
// Add query params later for filtering (e.g., ?status=pending)
router.get('/', transferAdminController.getAllTransfersAdmin);

// GET /api/admin/transfers/:transferId - Get specific transfer details (Admin only)
router.get('/:transferId', transferAdminController.getTransferByIdAdmin);

// PUT /api/admin/transfers/:transferId/status - Update transfer status (Admin only)
router.put('/:transferId/status', transferAdminController.updateTransferStatusAdmin);

export default router;