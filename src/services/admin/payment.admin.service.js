// // backend/src/services/admin/payment.admin.service.js
// import Payment from '../../models/Payment.js';
// import Account from '../../models/Account.js'; // **Ensure this import is present and correct**

// const getAllPaymentsAdmin = async () => {
//     return await Payment.find().populate(['user', 'balanceCurrency', 'payInCurrency']);
// };

// const getPaymentByIdAdmin = async (paymentId) => {
//     return await Payment.findById(paymentId).populate(['user', 'balanceCurrency', 'payInCurrency']);
// };

// const updatePaymentStatusAdmin = async (paymentId, status) => {
//     console.log(`Service: updatePaymentStatusAdmin - paymentId: ${paymentId}, status: ${status}`);

//     const payment = await Payment.findById(String(paymentId)).populate(['user', 'balanceCurrency', 'payInCurrency']);
//     if (!payment) {
//         console.log(`Service: updatePaymentStatusAdmin - Payment not found for id: ${paymentId}`);
//         throw new Error('Payment not found.');
//     }
//     payment.status = status;

//     if (status === 'completed') {
//         console.log(`Service: updatePaymentStatusAdmin - Status is 'completed', proceeding to update balance`);
//         const account = await Account.findOne({ user: payment.user._id, currency: payment.balanceCurrency._id });
//         if (!account) {
//             console.log(`Service: updatePaymentStatusAdmin - Account not found for user: ${payment.user._id}, currency: ${payment.balanceCurrency._id}`);
//             throw new Error('Account not found for user and currency.');
//         }
//         console.log(`Service: updatePaymentStatusAdmin - Account found, current balance: ${account.balance}, amountToAdd: ${payment.amountToAdd}`);
//         account.balance += payment.amountToAdd;
//         await account.save();
//         console.log(`Service: updatePaymentStatusAdmin - Account balance updated, new balance: ${account.balance}`);
//     } else {
//         console.log(`Service: updatePaymentStatusAdmin - Status is not 'completed', balance NOT updated`);
//     }

//     await payment.save();
//     const populatedPayment = await payment.populate(['user', 'balanceCurrency', 'payInCurrency']);
//     console.log(`Service: updatePaymentStatusAdmin - Payment status updated, returning populated payment`);
//     return populatedPayment;
// };

// export default {
//     getAllPaymentsAdmin,
//     getPaymentByIdAdmin,
//     updatePaymentStatusAdmin,
// };




// backend/src/services/admin/payment.admin.service.js
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation
import Payment from '../../models/Payment.js';
import Account from '../../models/Account.js';

// Define allowed status transitions for admin updates
const ALLOWED_PAYMENT_STATUS_UPDATES = ['pending', 'completed', 'failed', 'in progress', 'canceled'];
const TERMINAL_STATUSES = ['completed', 'failed', 'canceled'];

const getAllPaymentsAdmin = async () => {
    // Populate completedAt field if needed in the response
    return await Payment.find().populate(['user', 'balanceCurrency', 'payInCurrency']).sort({ createdAt: 'desc' });
};

const getPaymentByIdAdmin = async (paymentId) => {
    // Populate completedAt field if needed in the response
    return await Payment.findById(paymentId).populate(['user', 'balanceCurrency', 'payInCurrency']);
};

/**
 * Updates the status of a Payment record by Admin.
 * Handles balance updates only when transitioning to 'completed'.
 * Prevents updates from terminal states.
 *
 * @param {string} paymentId - The ID of the payment to update.
 * @param {string} newStatus - The desired new status.
 * @param {string|null} failureReason - Optional reason if status is 'failed' or 'canceled'.
 * @returns {Promise<object>} The updated and populated payment object.
 * @throws {Error} If validation fails, payment not found, or update is not allowed.
 */
const updatePaymentStatusAdmin = async (paymentId, newStatus, failureReason = null) => {
    console.log(`[Admin Payment Service] Attempting to update payment ${paymentId} to status '${newStatus}'`);

    // 1. Validate Payment ID format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        console.error(`[Admin Payment Service] Invalid payment ID format: ${paymentId}`);
        throw new Error('Invalid payment ID format.');
    }

    // 2. Validate the target status
    if (!ALLOWED_PAYMENT_STATUS_UPDATES.includes(newStatus)) {
        console.error(`[Admin Payment Service] Invalid target status for payment ${paymentId}: '${newStatus}'. Allowed: ${ALLOWED_PAYMENT_STATUS_UPDATES.join(', ')}`);
        throw new Error(`Invalid status update value. Allowed values are: ${ALLOWED_PAYMENT_STATUS_UPDATES.join(', ')}`);
    }

    try {
        // 3. Find the payment
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            console.error(`[Admin Payment Service] Payment ${paymentId} not found.`);
            throw new Error('Payment not found.');
        }

        const currentStatus = payment.status;
        console.log(`[Admin Payment Service] Payment ${paymentId} found. Current status: '${currentStatus}'. Target status: '${newStatus}'.`);


        // 4. Check if update is allowed from the current status
        if (TERMINAL_STATUSES.includes(currentStatus)) {
            console.warn(`[Admin Payment Service] Attempted to update terminal status for payment ${paymentId}. Current: '${currentStatus}', Target: '${newStatus}'. Update blocked.`);
            // Throw specific error indicating why update failed
            throw new Error(`Cannot update status for a payment that is already ${currentStatus}.`);
        }

        // --- Core Logic: Status Change, Balance Update, Timestamps ---

        // 5. Handle balance update and completedAt timestamp ONLY if moving TO 'completed'
        if (newStatus === 'completed') {
            // Only proceed if not already completed (double-check, though step 4 should prevent this)
            if (currentStatus !== 'completed') {
                console.log(`[Admin Payment Service] Status is 'completed'. Attempting balance update for user ${payment.user}, currency ${payment.balanceCurrency}.`);
                const account = await Account.findOne({ user: payment.user, currency: payment.balanceCurrency });
                if (!account) {
                    console.error(`[Admin Payment Service] CRITICAL: Account not found for user ${payment.user}, currency ${payment.balanceCurrency}. Cannot complete payment ${paymentId}.`);
                    // This is a critical internal error state
                    throw new Error(`Associated account not found. Cannot mark payment ${paymentId} as completed.`);
                }

                console.log(`[Admin Payment Service] Account ${account._id} found. Current balance: ${account.balance}. Amount to add: ${payment.amountToAdd}`);
                account.balance += payment.amountToAdd; // Add the amount
                await account.save(); // Save the updated account balance
                console.log(`[Admin Payment Service] Account balance updated successfully. New balance: ${account.balance}`);

                // Set the completedAt timestamp ONLY when marking as completed
                payment.completedAt = new Date();
                console.log(`[Admin Payment Service] Set completedAt timestamp for payment ${paymentId} to ${payment.completedAt}`);
            } else {
                 // This case should ideally not be reached due to step 4
                 console.log(`[Admin Payment Service] Payment ${paymentId} is already 'completed'. No balance change or completedAt update needed.`);
            }
        } else {
            // If moving TO a non-completed status FROM 'completed'
            if (currentStatus === 'completed') {
                console.warn(`[Admin Payment Service] Payment ${paymentId} status changing FROM 'completed' to '${newStatus}'. Clearing completedAt timestamp. Balance was already added and is NOT automatically reversed.`);
                payment.completedAt = null; // Clear the completed timestamp
            }
            // No balance change needed for other status transitions (pending, in progress, failed, canceled)
            console.log(`[Admin Payment Service] Status is '${newStatus}'. Balance will NOT be changed for payment ${paymentId}.`);
        }

        // 6. Update Payment Fields
        payment.status = newStatus;
        // Mongoose `timestamps: true` will handle `updatedAt` automatically on save

        // Handle failure reason
        if ((newStatus === 'failed' || newStatus === 'canceled') && failureReason) {
             payment.failureReason = failureReason; // Assuming 'failureReason' field exists in Payment model
             console.log(`[Admin Payment Service] Set failureReason for payment ${paymentId}: '${failureReason}'`);
        } else {
             payment.failureReason = undefined; // Clear reason if status is not failed/canceled or no reason provided
        }

        // 7. Save the updated payment
        await payment.save();
        console.log(`[Admin Payment Service] Payment ${paymentId} status updated successfully in DB to '${newStatus}'.`);

        // 8. Return the updated and populated payment
        // Populate necessary fields for the response
        const populatedPayment = await Payment.findById(payment._id).populate(['user', 'balanceCurrency', 'payInCurrency']);
        console.log(`[Admin Payment Service] Returning populated payment ${paymentId}.`);
        return populatedPayment;

    } catch (error) {
        console.error(`[Admin Payment Service] Error during status update for payment ${paymentId}:`, error);
        // Re-throw specific known errors for the controller to handle appropriately
        if (error.message.includes('Invalid payment ID') ||
            error.message.includes('Invalid status update value') ||
            error.message.includes('Payment not found') ||
            error.message.includes('Cannot update status') ||
            error.message.includes('Associated account not found'))
        {
            throw error; // Let the controller catch these specific messages
        }
        // Throw a more generic error for unexpected issues
        throw new Error(`Failed to update payment status for ID ${paymentId}.`);
    }
};

export default {
    getAllPaymentsAdmin,
    getPaymentByIdAdmin,
    updatePaymentStatusAdmin,
};