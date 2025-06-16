// import paymentService from '../services/payment.service.js';

// const calculatePaymentSummary = async (req, res, next) => { // Controller for summary calculation
//     try {
//         const userId = req.user._id; // From auth middleware
//         const { balanceCurrencyCode, payInCurrencyCode, amountToAdd } = req.body;

//         if (!balanceCurrencyCode || !payInCurrencyCode || !amountToAdd) {
//             return res.status(400).json({ message: 'Missing required fields.' });
//         }

//         const paymentSummary = await paymentService.calculatePaymentSummary(userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd); // Call renamed service
//         res.status(200).json(paymentSummary); // Respond with summary
//     } catch (error) {
//         next(error); // Pass error to error handling middleware
//     }
// };


// const initiatePaymentAndSave = async (req, res, next) => { // New controller for saving payment
//     try {
//         // We expect to receive the payment summary data from the frontend now
//         const paymentSummary = req.body; // Frontend will send the summary data

//         if (!paymentSummary || !paymentSummary.balanceCurrencyCode || !paymentSummary.payInCurrencyCode || !paymentSummary.amountToAdd) {
//             return res.status(400).json({ message: 'Missing required payment summary data.' });
//         }

//         const payment = await paymentService.initiatePaymentAndSave(paymentSummary); // Call new service function to save
//         res.status(201).json(payment); // Respond with created payment details
//     } catch (error) {
//         next(error); // Pass error to error handling middleware
//     }
// };


// const getPaymentDetails = async (req, res, next) => {
//     try {
//         const paymentId = req.params.paymentId;
//         const payment = await paymentService.getPaymentDetails(paymentId);
//         if (!payment) {
//             return res.status(404).json({ message: 'Payment not found.' });
//         }
//         res.json(payment);
//     } catch (error) {
//         next(error); // Pass error to error handling middleware
//     }
// };


// export default {
//     calculatePaymentSummary, // Export new controller
//     initiatePaymentAndSave, // Export new controller for saving
//     getPaymentDetails,
// };


// backend/src/controllers/payment.controller.js
import paymentService from '../services/payment.service.js';

const calculatePaymentSummary = async (req, res, next) => { // Controller for summary calculation
    try {
        const userId = req.user._id; // From auth middleware
        const { balanceCurrencyCode, payInCurrencyCode, amountToAdd } = req.body;

        if (!balanceCurrencyCode || !payInCurrencyCode || !amountToAdd) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const paymentSummary = await paymentService.calculatePaymentSummary(userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd); // Call renamed service
        res.status(200).json(paymentSummary); // Respond with summary
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};
const getUserPayments = async (req, res, next) => {
    try {
        const userId = req.user._id; // User ID from authMiddleware
        const payments = await paymentService.getUserPayments(userId); // Call service function
        res.json(payments);
    } catch (error) {
        next(error);
    }
};


const initiatePaymentAndSave = async (req, res, next) => { // New controller for saving payment
    try {
        // We expect to receive the payment summary data from the frontend now
        const paymentSummary = req.body; // Frontend will send the summary data

        if (!paymentSummary || !paymentSummary.balanceCurrencyCode || !paymentSummary.payInCurrencyCode || !paymentSummary.amountToAdd) {
            return res.status(400).json({ message: 'Missing required payment summary data.' });
        }

        const payment = await paymentService.initiatePaymentAndSave(paymentSummary); // Call new service function to save
        res.status(201).json(payment); // Respond with created payment details
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};


const getPaymentDetails = async (req, res, next) => {
    try {
        const paymentId = req.params.paymentId;
        const payment = await paymentService.getPaymentDetails(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        res.json(payment);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};


const getUserBalancePayments = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { balanceCurrencyId } = req.params; // balanceCurrencyId instead of balanceId to be specific
        const payments = await paymentService.getUserBalancePayments(userId, balanceCurrencyId);
        res.json(payments);
    } catch (error) {
        next(error);
    }
};


const cancelPayment = async (req, res, next) => {
    try {
        const paymentId = req.params.paymentId;
        const canceledPayment = await paymentService.cancelPayment(paymentId, req.user._id);
        if (!canceledPayment) {
            return res.status(404).json({ message: 'Payment not found or cannot be canceled.' });
        }
        res.json({ message: 'Payment canceled successfully', payment: canceledPayment });
    } catch (error) {
        if (error.message === 'Unauthorized cancellation') {
            return res.status(403).json({ message: 'Unauthorized to cancel this payment.' });
        }
        next(error);
    }
};

// NEW Controller: Handle user confirming transfer
const confirmUserTransfer = async (req, res, next) => {
    try {
        const paymentId = req.params.paymentId;
        const userId = req.user._id; // From authMiddleware

        const updatedPayment = await paymentService.confirmUserTransfer(paymentId, userId);

        if (!updatedPayment) {
            // Specific errors handled in service, this is fallback
            return res.status(404).json({ message: 'Payment not found or cannot be updated.' });
        }

        res.status(200).json({ message: 'Payment status updated to in progress.', payment: updatedPayment });
    } catch (error) {
        if (error.message === 'Unauthorized action' || error.message === 'Payment not found.' || error.message === 'Payment not in pending state.') {
             return res.status(400).json({ message: error.message }); // Use 400 for client errors
        }
        next(error); // Pass other errors to general handler
    }
};

export default {
    calculatePaymentSummary,
    initiatePaymentAndSave,
    getPaymentDetails,
    getUserBalancePayments,
    cancelPayment,
    getUserPayments,
    confirmUserTransfer,
};