// // backend/src/services/admin/transfer.admin.service.js
// import Transfer from '../../models/Transfer.js';
// import mongoose from 'mongoose';

// const ALLOWED_STATUS_UPDATES = ['processing', 'completed', 'failed', 'canceled']; // Statuses admin can set

// // Service to get all transfers for admin view
// const getAllTransfersAdmin = async (filters = {}) => {
//     console.log("Service: getAllTransfersAdmin - Filters:", filters);
//     const query = {};
//     if (filters.status && ['pending', 'processing', 'completed', 'failed', 'canceled'].includes(filters.status)) {
//         query.status = filters.status;
//     }
//     // Add more filters later (user, date range, etc.)

//     try {
//         // Populate related data for admin display
//         const transfers = await Transfer.find(query)
//             .populate('user', 'fullName email') // Get user's name/email
//             .populate({ // Get recipient details
//                 path: 'recipient',
//                 select: 'accountHolderName nickname accountNumber bankName', // Select specific fields
//                  populate: { path: 'currency', select: 'code' } // And recipient currency
//             })
//             .populate('sendCurrency', 'code') // Send currency code
//             .populate('receiveCurrency', 'code') // Receive currency code
//             .sort({ createdAt: -1 }); // Show newest first
//             // TODO: Add pagination ( .limit(limit).skip(skip) )

//         console.log(`Service: getAllTransfersAdmin - Found ${transfers.length} transfers.`);
//         return transfers;
//     } catch (error) {
//          console.error("Service: getAllTransfersAdmin - Error fetching transfers:", error);
//          throw new Error("Failed to fetch transfers for admin.");
//     }
// };

// // Service to get a single transfer by ID for admin view
// const getTransferByIdAdmin = async (transferId) => {
//     console.log(`Service: getTransferByIdAdmin - Fetching transfer with ID: ${transferId}`); // <--- LOG 1: ID received

//     if (!mongoose.Types.ObjectId.isValid(transferId)) {
//         console.log(`Service: getTransferByIdAdmin - Invalid transfer ID format: ${transferId}`); // <--- LOG 2: Invalid ID format
//         throw new Error('Invalid transfer ID format.');
//     }
//     try {
//         console.log(`Service: getTransferByIdAdmin - Attempting to find transfer in DB with ID: ${transferId}`); // <--- LOG 3: Before DB query
//         const transfer = await Transfer.findById(transferId)
//             .populate('user', 'fullName email role') // Include role maybe
//             .populate({ path: 'sourceAccount', select: 'balance currency', populate: { path: 'currency', select: 'code' } })
//             .populate({ path: 'recipient', populate: { path: 'currency', select: 'code' } }) // Populate full recipient + currency
//             .populate('sendCurrency', 'code flagImage') // <---- ADD this line to populate sendCurrency with code and flagImage
//             .populate('receiveCurrency', 'code flagImage'); // <---- ADD this line to populate receiveCurrency with code and flagImage
//         console.log(`Service: getTransferByIdAdmin - DB Query Result for ID ${transferId}:`, transfer); // <--- LOG 4: After DB query

//         if (!transfer) {
//             console.log(`Service: getTransferByIdAdmin - Transfer ${transferId} not found in DB.`); // <--- LOG 5: Not found in DB
//             throw new Error('Transfer not found.');
//         }
//         console.log(`Service: getTransferByIdAdmin - Transfer ${transferId} found and fetched.`); // <--- LOG 6: Successfully found
//         return transfer;
//     } catch (error) {
//          console.error(`Service: getTransferByIdAdmin - Error fetching transfer ${transferId}:`, error);
//          throw new Error("Failed to fetch transfer details for admin.");
//     }
// };

// // Service to update the status of a transfer by admin
// const updateTransferStatusAdmin = async (transferId, newStatus, failureReason = null) => {
//     console.log(`Service: updateTransferStatusAdmin - Updating ${transferId} to status '${newStatus}'`);
//     if (!mongoose.Types.ObjectId.isValid(transferId)) {
//         throw new Error('Invalid transfer ID format.');
//     }

//     // 1. Validate the new status
//     if (!ALLOWED_STATUS_UPDATES.includes(newStatus)) {
//         console.error(`Service: updateTransferStatusAdmin - Invalid target status: ${newStatus}`);
//         throw new Error(`Invalid status update value. Allowed values are: ${ALLOWED_STATUS_UPDATES.join(', ')}`);
//     }

//     try {
//         // 2. Find the transfer
//         const transfer = await Transfer.findById(transferId);
//         if (!transfer) {
//             console.error(`Service: updateTransferStatusAdmin - Transfer ${transferId} not found.`);
//             throw new Error('Transfer not found.');
//         }

//         // 3. Check if update is allowed (e.g., don't update already completed/failed)
//         if (['completed', 'failed', 'canceled'].includes(transfer.status)) {
//             console.warn(`Service: updateTransferStatusAdmin - Attempted to update terminal status for transfer ${transferId}. Current: ${transfer.status}`);
//             throw new Error(`Cannot update status for a transfer that is already ${transfer.status}.`);
//         }

//         // 4. (Optional but Recommended) Check if it's moving *from* pending
//         const wasPending = transfer.status === 'pending';

//         // 5. Update status and potentially failure reason
//         transfer.status = newStatus;
//         transfer.updatedAt = new Date();
//         if ((newStatus === 'failed' || newStatus === 'canceled') && failureReason) {
//             transfer.failureReason = failureReason;
//         } else {
//              transfer.failureReason = undefined; // Clear reason if status is not failed/canceled
//         }

//         if (wasPending && (newStatus === 'processing' || newStatus === 'completed')) {
//             console.log(`Service: updateTransferStatusAdmin - TODO: Trigger external payout for transfer ${transferId} as status moved from pending.`);
//         }
//         // *****************************************************

//         // 7. Save the updated transfer
//         await transfer.save(); // Note: This save is outside the original transaction, which is correct here.
//         console.log(`Service: updateTransferStatusAdmin - Transfer ${transferId} status updated successfully to '${newStatus}'.`);

//         // 8. Return the updated and populated transfer
//         // Use the other service function to ensure consistent population
//         return await getTransferByIdAdmin(transferId);

//     } catch (error) {
//          console.error(`Service: updateTransferStatusAdmin - Error updating transfer ${transferId}:`, error);
//          // Re-throw specific known errors, otherwise throw generic
//          if (error.message.includes('Invalid status') || error.message.includes('Transfer not found') || error.message.includes('Cannot update status')) {
//              throw error;
//          }
//          throw new Error("Failed to update transfer status.");
//     }
// };


// export default {
//     getAllTransfersAdmin,
//     getTransferByIdAdmin,
//     updateTransferStatusAdmin,
// };


// backend/src/services/admin/transfer.admin.service.js
import Transfer from '../../models/Transfer.js';
import Account from '../../models/Account.js'; // <-- Import Account model
import mongoose from 'mongoose';

const ALLOWED_STATUS_UPDATES = ['processing', 'completed', 'failed', 'canceled'];

// Service to get all transfers for admin view (no change needed)
const getAllTransfersAdmin = async (filters = {}) => {
    console.log("Service: getAllTransfersAdmin - Filters:", filters);
    const query = {};
    if (filters.status && ['pending', 'processing', 'completed', 'failed', 'canceled'].includes(filters.status)) {
        query.status = filters.status;
    }
    // Add more filters later (user, date range, etc.)

    try {
        const transfers = await Transfer.find(query)
            .populate('user', 'fullName email')
            .populate({
                path: 'recipient',
                select: 'accountHolderName nickname accountNumber bankName',
                 populate: { path: 'currency', select: 'code' }
            })
            .populate('sendCurrency', 'code')
            .populate('receiveCurrency', 'code')
            .sort({ createdAt: -1 });
        console.log(`Service: getAllTransfersAdmin - Found ${transfers.length} transfers.`);
        return transfers;
    } catch (error) {
         console.error("Service: getAllTransfersAdmin - Error fetching transfers:", error);
         throw new Error("Failed to fetch transfers for admin.");
    }
};

// Service to get a single transfer by ID for admin view (no change needed, assuming previous fix is correct)
const getTransferByIdAdmin = async (transferId) => {
    console.log(`Service: getTransferByIdAdmin - Fetching transfer with ID: ${transferId}`);

    if (!mongoose.Types.ObjectId.isValid(transferId)) {
        console.log(`Service: getTransferByIdAdmin - Invalid transfer ID format: ${transferId}`);
        throw new Error('Invalid transfer ID format.');
    }
    try {
        console.log(`Service: getTransferByIdAdmin - Attempting to find transfer in DB with ID: ${transferId}`);
        const transfer = await Transfer.findById(transferId)
            .populate('user', 'fullName email role')
            .populate({ path: 'sourceAccount', select: 'balance currency', populate: { path: 'currency', select: 'code' } })
            .populate({ path: 'recipient', populate: { path: 'currency', select: 'code' } })
            .populate('sendCurrency', 'code flagImage')
            .populate('receiveCurrency', 'code flagImage');
        console.log(`Service: getTransferByIdAdmin - DB Query Result for ID ${transferId}:`, transfer ? 'Found' : 'Not Found'); // Simplified log

        if (!transfer) {
            console.log(`Service: getTransferByIdAdmin - Transfer ${transferId} not found in DB.`);
            throw new Error('Transfer not found.');
        }
        console.log(`Service: getTransferByIdAdmin - Transfer ${transferId} found and fetched.`);
        return transfer;
    } catch (error) {
         console.error(`Service: getTransferByIdAdmin - Error fetching transfer ${transferId}:`, error.message); // Log error message
         // Avoid re-throwing generic message if specific one already exists
         if (error instanceof Error && (error.message.includes('Invalid transfer ID format') || error.message.includes('Transfer not found'))) {
             throw error;
         }
         throw new Error(`Failed to fetch transfer details for admin: ${error.message}`);
    }
};


// --- START FIX ---

// Service to update the status of a transfer by admin (WITH REFUND LOGIC)
const updateTransferStatusAdmin = async (transferId, newStatus, failureReason = null) => {
    console.log(`Service: updateTransferStatusAdmin - Updating ${transferId} to status '${newStatus}'`);
    if (!mongoose.Types.ObjectId.isValid(transferId)) {
        throw new Error('Invalid transfer ID format.');
    }

    // 1. Validate the new status
    if (!ALLOWED_STATUS_UPDATES.includes(newStatus)) {
        console.error(`Service: updateTransferStatusAdmin - Invalid target status: ${newStatus}`);
        throw new Error(`Invalid status update value. Allowed values are: ${ALLOWED_STATUS_UPDATES.join(', ')}`);
    }

    const session = await mongoose.startSession(); // Use a transaction
    session.startTransaction();

    try {
        // 2. Find the transfer within the transaction
        const transfer = await Transfer.findById(transferId).session(session);
        if (!transfer) {
            await session.abortTransaction();
            session.endSession();
            console.error(`Service: updateTransferStatusAdmin - Transfer ${transferId} not found.`);
            throw new Error('Transfer not found.');
        }

        const originalStatus = transfer.status; // Store original status for logic checks

        // 3. Check if update is allowed (e.g., don't update already completed/failed/canceled)
        if (['completed', 'failed', 'canceled'].includes(originalStatus)) {
            await session.abortTransaction();
            session.endSession();
            console.warn(`Service: updateTransferStatusAdmin - Attempted to update terminal status for transfer ${transferId}. Current: ${originalStatus}`);
            throw new Error(`Cannot update status for a transfer that is already ${originalStatus}.`);
        }

        // 4. Determine if a refund is needed
        // Refund if changing to 'failed' or 'canceled' FROM a non-terminal state ('pending' or 'processing')
        // Assumes funds were debited during executeTransfer (when status was set to 'pending')
        const needsRefund = (newStatus === 'failed' || newStatus === 'canceled') &&
                            (originalStatus === 'pending' || originalStatus === 'processing');

        if (needsRefund) {
            console.log(`Service: updateTransferStatusAdmin - Refund needed for transfer ${transferId}. New status: ${newStatus}, Original: ${originalStatus}`);
            if (transfer.sourceAccount && transfer.sendAmount > 0) {
                const sourceAccount = await Account.findById(transfer.sourceAccount).session(session);
                if (!sourceAccount) {
                    // Critical inconsistency
                    await session.abortTransaction();
                    session.endSession();
                    console.error(`Service: updateTransferStatusAdmin - Critical error: Source account ${transfer.sourceAccount} not found for transfer ${transferId} during refund.`);
                    throw new Error('Failed to update status: Source account data missing for refund.');
                }
                // Add the sent amount back to the balance
                sourceAccount.balance += transfer.sendAmount;
                await sourceAccount.save({ session });
                console.log(`Service: updateTransferStatusAdmin - Refunded ${transfer.sendAmount} to account ${transfer.sourceAccount}. New balance: ${sourceAccount.balance}`);
            } else {
                // Log a warning if refund needed but data is missing
                 console.warn(`Service: updateTransferStatusAdmin - Refund condition met for transfer ${transferId}, but source account (${transfer.sourceAccount}) or send amount (${transfer.sendAmount}) is invalid. Skipping refund step.`);
                 // Depending on business rules, you might want to throw an error here instead
            }
        }

        // 5. Update transfer status and potentially failure reason
        transfer.status = newStatus;
        transfer.updatedAt = new Date();
        if ((newStatus === 'failed' || newStatus === 'canceled') && failureReason) {
            transfer.failureReason = failureReason;
        } else if (newStatus !== 'failed' && newStatus !== 'canceled') {
             // Clear reason if status changes to something other than failed/canceled
             transfer.failureReason = undefined;
        }

        // 6. (Optional) Trigger external actions based on status change
        if (originalStatus === 'pending' && newStatus === 'processing') {
             console.log(`Service: updateTransferStatusAdmin - Status changed from pending to processing for ${transferId}. Consider triggering payout initiation.`);
        }
         if (originalStatus === 'processing' && newStatus === 'completed') {
             console.log(`Service: updateTransferStatusAdmin - Status changed from processing to completed for ${transferId}. Consider sending notifications.`);
        }

        // 7. Save the updated transfer within the transaction
        await transfer.save({ session });
        console.log(`Service: updateTransferStatusAdmin - Transfer ${transferId} status updated successfully to '${newStatus}'.`);

        // 8. Commit the transaction
        await session.commitTransaction();

        // 9. Return the updated and populated transfer (fetch outside transaction)
        // Use the other service function to ensure consistent population
        return await getTransferByIdAdmin(transferId);

    } catch (error) {
        // If anything fails, abort the transaction
        await session.abortTransaction();
        console.error(`Service: updateTransferStatusAdmin - Error during transaction for ${transferId}:`, error);
        // Re-throw specific known errors, otherwise throw generic
        if (error.message.includes('Invalid status') || error.message.includes('Transfer not found') || error.message.includes('Cannot update status') || error.message.includes('Source account data missing') || error.message.includes('Invalid transfer ID format')) {
            throw error;
        }
        throw new Error(`Failed to update transfer status: ${error.message}`);
    } finally {
         session.endSession(); // Always end the session
    }
};

// --- END FIX ---


export default {
    getAllTransfersAdmin,
    getTransferByIdAdmin,
    updateTransferStatusAdmin,
};