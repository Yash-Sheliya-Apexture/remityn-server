// // backend/src/routes/transfer.routes.js
// import express from 'express';
// import transferController from '../controllers/transfer.controller.js';
// import authMiddleware from '../middleware/auth.middleware.js';

// const router = express.Router();

// // Calculate send summary (POST because it might have side effects like checking balance)
// router.post('/calculate-summary', authMiddleware.protect, transferController.calculateSendSummary);

// // Execute a transfer (POST)
// router.post('/execute', authMiddleware.protect, transferController.executeTransfer);

// // Get details of a specific transfer (GET)
// router.get('/:transferId', authMiddleware.protect, transferController.getTransferDetails);

// // Get list of user's transfers (GET)
// router.get('/', authMiddleware.protect, transferController.getUserTransfers);


// export default router;


// backend/src/routes/transfer.routes.js
import express from 'express';
import transferController from '../controllers/transfer.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Calculate send summary (POST because it might have side effects like checking balance)
router.post('/calculate-summary', authMiddleware.protect, transferController.calculateSendSummary);

// Execute a transfer (POST)
router.post('/execute', authMiddleware.protect, transferController.executeTransfer);

// Get details of a specific transfer (GET)
router.get('/:transferId', authMiddleware.protect, transferController.getTransferDetails);

// Get list of user's transfers (GET)
router.get('/', authMiddleware.protect, transferController.getUserTransfers);

// --- START FIX ---
// Cancel a specific transfer (POST)
router.post('/:transferId/cancel', authMiddleware.protect, transferController.cancelTransfer);
// --- END FIX ---

export default router;