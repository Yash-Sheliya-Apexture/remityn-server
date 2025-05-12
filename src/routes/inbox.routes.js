// backend/src/routes/inbox.routes.js
import express from 'express';
import inboxController from '../controllers/inbox.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all inbox routes
router.use(authMiddleware.protect);

// GET /api/inbox - Get logged-in user's messages (with pagination)
router.get('/', inboxController.getMyInboxMessages);

// GET /api/inbox/unread-count - Get unread count for the user
router.get('/unread-count', inboxController.getMyUnreadCount);

// PUT /api/inbox/:messageId/read - Mark a message as read
router.put('/:messageId/read', inboxController.markMessageRead);

// DELETE /api/inbox/:messageId - Delete a message
router.delete('/:messageId', inboxController.deleteMessage);

export default router;