// backend/src/routes/admin/inbox.admin.routes.js
import express from 'express';
import inboxAdminController from '../../controllers/admin/inbox.admin.controller.js';

const router = express.Router();

// Note: authMiddleware.protect and authMiddleware.admin are applied in server.js

// GET /api/admin/inbox - Get all messages (with pagination/filtering)
router.get('/', inboxAdminController.getAllMessages); // Base is /api/admin/inbox

// PUT /api/admin/inbox/:messageId - Update a specific message by ID
router.put('/:messageId', inboxAdminController.updateMessageById); // Base is /api/admin/inbox

// DELETE /api/admin/inbox/:messageId - Delete a specific message by ID
router.delete('/:messageId', inboxAdminController.deleteMessageById); // Base is /api/admin/inbox

// --- NEW ROUTE for sending to all ---
// POST /api/admin/inbox/send-to-all
router.post('/send-to-all', inboxAdminController.sendMessageToAllUsers); // <-- ADD THIS LINE

// --- NEW Batch Routes ---
router.get('/batches', inboxAdminController.getBatches);          // List unique broadcast batches
router.delete('/batch/:batchId', inboxAdminController.deleteBatch); // Delete an entire batch
router.put('/batch/:batchId', inboxAdminController.updateBatch); // <-- ADD THIS LINE

export default router;