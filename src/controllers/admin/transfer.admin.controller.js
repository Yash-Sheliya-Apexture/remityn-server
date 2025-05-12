// backend/src/controllers/admin/transfer.admin.controller.js
import transferAdminService from '../../services/admin/transfer.admin.service.js';

// Get all transfers (potentially filtered)
const getAllTransfersAdmin = async (req, res, next) => {
    try {
        // TODO: Add filtering (e.g., by status from req.query) and pagination later
        const filters = req.query; // Example: req.query.status
        const transfers = await transferAdminService.getAllTransfersAdmin(filters);
        res.json(transfers);
    } catch (error) {
        next(error);
    }
};

// Get a single transfer by ID
const getTransferByIdAdmin = async (req, res, next) => {
    try {
        const { transferId } = req.params;
        console.log(`Controller: getTransferByIdAdmin - Received transferId: ${transferId}`); // <-- KEEP THIS LOG
        const transfer = await transferAdminService.getTransferByIdAdmin(transferId);
        if (!transfer) {
            console.log(`Controller: getTransferByIdAdmin - Transfer not found for ID: ${transferId}`); // <-- KEEP THIS LOG
            return res.status(404).json({ message: 'Transfer not found' });
        }
        res.json(transfer);
    } catch (error) {
         console.error("Controller: getTransferByIdAdmin - Error:", error); // <--- Log the full error
         if (error.message.includes('Invalid transfer ID format')) {
             return res.status(400).json({ message: error.message });
         }
        next(error);
    }
};


// Update the status of a transfer
const updateTransferStatusAdmin = async (req, res, next) => {
    try {
        const { transferId } = req.params;
        const { status, failureReason } = req.body; // Expect 'status', optionally 'failureReason'

        // Basic validation for required status
        if (!status) {
            return res.status(400).json({ message: 'New status is required' });
        }

        // More robust validation can happen in the service
        const updatedTransfer = await transferAdminService.updateTransferStatusAdmin(transferId, status, failureReason);

        res.json(updatedTransfer);
    } catch (error) {
         if (error.message.includes('Invalid status') || error.message.includes('Invalid transfer ID format')) {
             return res.status(400).json({ message: error.message });
         }
         if (error.message === 'Transfer not found.') {
            return res.status(404).json({ message: error.message });
         }
         if (error.message === 'Cannot update status for a transfer that is already completed or failed.') {
             return res.status(409).json({ message: error.message }); // 409 Conflict
         }
        next(error);
    }
};


export default {
    getAllTransfersAdmin,
    getTransferByIdAdmin,
    updateTransferStatusAdmin,
};