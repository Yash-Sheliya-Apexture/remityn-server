// backend/src/routes/recipient.routes.js
import express from 'express';
import recipientController from '../controllers/recipient.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { validateAddRecipient } from '../middleware/recipient.validation.middleware.js';

const router = express.Router();

router.post('/',
    authMiddleware.protect,
    validateAddRecipient, // Apply the validation middleware here
    recipientController.addRecipient
); // Add new recipient
router.get('/', authMiddleware.protect, recipientController.getUserRecipients); // Get user's recipients
router.get('/:recipientId', authMiddleware.protect, recipientController.getRecipientById); // Get recipient by ID
router.put('/:recipientId', authMiddleware.protect, recipientController.updateRecipient); // Update recipient details (like nickname)
router.delete('/:recipientId', authMiddleware.protect, recipientController.deleteRecipient); // Delete recipient

export default router;