import paymentAdminService from '../../services/admin/payment.admin.service.js';

const getAllPaymentsAdmin = async (req, res, next) => {
    try {
        const payments = await paymentAdminService.getAllPaymentsAdmin();
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

const getPaymentByIdAdmin = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const payment = await paymentAdminService.getPaymentByIdAdmin(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        next(error);
    }
};


const updatePaymentStatusAdmin = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { status, failureReason } = req.body; // Expecting 'status' in the request body

        // --- Define allowed statuses ---
        // *** FIX: Add 'failed' to the list of allowed statuses ***
        const allowedStatuses = ['pending', 'completed', 'canceled', 'in progress', 'failed'];

        // --- Improved Validation and Logging ---
        if (!status) {
            console.error(`[Admin Controller] Update failed for payment ${paymentId}: Status field is missing in request body.`);
            return res.status(400).json({ message: 'Missing required status field in request body.' });
        }

        if (!allowedStatuses.includes(status)) {
             console.error(`[Admin Controller] Update failed for payment ${paymentId}: Invalid status value received: '${status}'. Allowed: ${allowedStatuses.join(', ')}`);
             // Provide a more informative error message back to the client
             return res.status(400).json({ message: `Invalid payment status provided: '${status}'. Must be one of: ${allowedStatuses.join(', ')}.` });
        }
        // --- End Fix ---

        console.log(`[Admin Controller] Processing request to update payment ${paymentId} to status: '${status}'`);
        const updatedPayment = await paymentAdminService.updatePaymentStatusAdmin(paymentId, status, failureReason);

        // The service now throws if payment not found, so this check might be less critical,
        // but we keep it as a safeguard or if the service changes behavior.
        if (!updatedPayment) {
            // This path might not be reached if the service throws 'Payment not found.'
            console.warn(`[Admin Controller] Service call for updatePaymentStatusAdmin did not return a payment object for ID ${paymentId}.`);
            return res.status(404).json({ message: 'Payment not found or could not be updated.' });
        }

        console.log(`[Admin Controller] Successfully updated payment ${paymentId} to status '${status}'. Sending response.`);
        res.json(updatedPayment); // Send the successfully updated payment back

    } catch (error) { // Using 'any' for broader catch, refine if possible
        console.error(`[Admin Controller] Error during update for payment ${req.params.paymentId} with status '${req.body.status}':`, error);

        // Handle specific errors potentially thrown by the service
        if (error.message === 'Payment not found.') {
            return res.status(404).json({ message: error.message });
        }
        // Handle the specific error for account not found during completion
        if (error.message.startsWith('Account not found')) {
             // Consider this a server-side issue preventing completion
             return res.status(500).json({ message: 'Internal Server Error: Associated account not found, cannot complete payment.' });
        }

        // For any other errors, pass them to the global error handler
        next(error);
    }
};


export default {
    getAllPaymentsAdmin,
    getPaymentByIdAdmin,
    updatePaymentStatusAdmin,
};