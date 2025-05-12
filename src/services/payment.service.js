// import Payment from '../models/Payment.js';
// import Currency from '../models/Currency.js';
// import { v4 as uuidv4 } from 'uuid'; // For generating unique reference codes

// const generateReferenceCode = () => {
//     return `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
// };

// // Mock function for exchange rate (replace with real API call or database lookup)
// const getExchangeRate = async (fromCurrencyCode, toCurrencyCode) => {
//     // In a real application, fetch exchange rates from a reliable API or database
//     // For now, returning a mock rate for EUR to AUD (1 EUR = 1.717 AUD as per image)
//     if (fromCurrencyCode === 'EUR' && toCurrencyCode === 'AUD') {
//         return 1.717;
//     }
//     if (fromCurrencyCode === 'AUD' && toCurrencyCode === 'EUR') {
//         return 1 / 1.717;
//     }
//     // Add more mock rates or default/error handling as needed
//     return 1.0; // Default rate if not found
// };


// const calculateFees = async (amount, payInCurrencyCode) => { // Make async to fetch currency details
//     const currency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
//     if (!currency) {
//         throw new Error('Currency not found for fee calculation.'); // Handle currency not found
//     }

//     const wiseFeePercentage = currency.wiseFeePercentage || 0; // Use currency's percentage or default
//     const wiseFee = amount * wiseFeePercentage;
//     const bankTransferFee = currency.bankTransferFee || 0;      // Use currency's fixed fee or default

//     return { wiseFee, bankTransferFee };
// };

// // Replaced getWiseBankDetails with getCurrencyBankDetails
// const getCurrencyBankDetails = async (payInCurrencyCode) => {
//     const currency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
//     if (currency) {
//         return {
//             payeeName: currency.payeeName,
//             iban: currency.iban,
//             bicSwift: currency.bicSwift,
//             bankAddress: currency.bankAddress,
//         };
//     }
//     return null;
// };


// const calculatePaymentSummary = async (userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd) => {
//     const balanceCurrency = await Currency.findOne({ code: balanceCurrencyCode.toUpperCase() });
//     const payInCurrency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });

//     if (!balanceCurrency || !payInCurrency) {
//         throw new Error('Invalid currency codes.');
//     }

//     const exchangeRate = await getExchangeRate(payInCurrencyCode, balanceCurrencyCode);
//     const fees = await calculateFees(amountToAdd, payInCurrencyCode); // Await the fees calculation
//     const amountToPay = (amountToAdd * exchangeRate) + fees.wiseFee + fees.bankTransferFee;

//     const paymentSummary = {
//         amountToPay,
//         exchangeRate,
//         wiseFee: fees.wiseFee,
//         bankTransferFee: fees.bankTransferFee,
//         balanceCurrencyCode,
//         payInCurrencyCode,
//         amountToAdd,
//         userId,
//     };

//     return paymentSummary;
// };


// const initiatePaymentAndSave = async (paymentSummary) => {
//     try { // ADD TRY-CATCH BLOCK
//         const { userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd, amountToPay, exchangeRate, wiseFee, bankTransferFee } = paymentSummary;

//         const balanceCurrency = await Currency.findOne({ code: balanceCurrencyCode.toUpperCase() });
//         const payInCurrency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
//         const referenceCode = generateReferenceCode();
//         const bankDetails = await getCurrencyBankDetails(payInCurrencyCode);


//         const newPayment = new Payment({
//             user: userId,
//             balanceCurrency: balanceCurrency._id,
//             payInCurrency: payInCurrency._id,
//             amountToAdd,
//             amountToPay,
//             exchangeRate,
//             wiseFee,
//             bankTransferFee,
//             referenceCode,
//             bankDetails,
//         });

//         await newPayment.save();
//         return await newPayment.populate(['balanceCurrency', 'payInCurrency']);
//     } catch (error) { // CATCH ERROR
//         console.error("Error in initiatePaymentAndSave service:", error); // LOG ERROR
//         throw error; // Re-throw the error so controller's error handler can catch it
//     }
// };


// const getPaymentDetails = async (paymentId) => {
//     return await Payment.findById(paymentId).populate(['balanceCurrency', 'payInCurrency']);
// };


// export default {
//     calculatePaymentSummary,
//     initiatePaymentAndSave,
//     getPaymentDetails,
// };


// import Payment from '../models/Payment.js';
// import Currency from '../models/Currency.js';
// import { v4 as uuidv4 } from 'uuid';

// const generateReferenceCode = () => {
//     return `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
// };

// const getExchangeRate = async (fromCurrencyCode, toCurrencyCode) => {
//     if (fromCurrencyCode === 'EUR' && toCurrencyCode === 'AUD') {
//         return 1.717;
//     }
//     if (fromCurrencyCode === 'AUD' && toCurrencyCode === 'EUR') {
//         return 1 / 1.717;
//     }
//     return 1.0;
// };

// const calculateFees = async (amount, payInCurrencyCode) => {
//     const currency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
//     if (!currency) {
//         throw new Error('Currency not found for fee calculation.');
//     }

//     const wiseFeePercentage = currency.wiseFeePercentage || 0;
//     const wiseFee = amount * wiseFeePercentage;
//     const bankTransferFee = currency.bankTransferFee || 0;

//     return { wiseFee, bankTransferFee };
// };

// const getCurrencyBankDetails = async (payInCurrencyCode) => {
//     const currency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
//     if (currency) {
//         return {
//             payeeName: currency.payeeName,
//             iban: currency.iban,
//             bicSwift: currency.bicSwift,
//             bankAddress: currency.bankAddress,
//         };
//     }
//     return null;
// };

// const calculatePaymentSummary = async (userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd) => {
//     const balanceCurrency = await Currency.findOne({ code: balanceCurrencyCode.toUpperCase() });
//     const payInCurrency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });

//     if (!balanceCurrency || !payInCurrency) {
//         throw new Error('Invalid currency codes.');
//     }

//     const exchangeRate = await getExchangeRate(payInCurrencyCode, balanceCurrencyCode);
//     const fees = await calculateFees(amountToAdd, payInCurrencyCode);
//     const amountToPay = (amountToAdd * exchangeRate) + fees.wiseFee + fees.bankTransferFee;

//     const paymentSummary = {
//         amountToPay,
//         exchangeRate,
//         wiseFee: fees.wiseFee,
//         bankTransferFee: fees.bankTransferFee,
//         balanceCurrencyCode,
//         payInCurrencyCode,
//         amountToAdd,
//         userId,
//     };

//     return paymentSummary;
// };

// const initiatePaymentAndSave = async (paymentSummary) => {
//     try {
//         const { userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd, amountToPay, exchangeRate, wiseFee, bankTransferFee } = paymentSummary;

//         const balanceCurrency = await Currency.findOne({ code: balanceCurrencyCode.toUpperCase() });
//         const payInCurrency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
//         const referenceCode = generateReferenceCode();
//         const bankDetails = await getCurrencyBankDetails(payInCurrencyCode);

//         const newPayment = new Payment({
//             user: userId,
//             balanceCurrency: balanceCurrency._id,
//             payInCurrency: payInCurrency._id,
//             amountToAdd,
//             amountToPay,
//             exchangeRate,
//             wiseFee,
//             bankTransferFee,
//             referenceCode,
//             bankDetails,
//         });

//         await newPayment.save();
//         return await newPayment.populate(['balanceCurrency', 'payInCurrency']);
//     } catch (error) {
//         console.error("Error in initiatePaymentAndSave service:", error);
//         throw error;
//     }
// };

// const getPaymentDetails = async (paymentId) => {
//     return await Payment.findById(paymentId).populate(['balanceCurrency', 'payInCurrency', 'user']); // Populate user here
// };

// const getUserBalancePayments = async (userId, balanceCurrencyId) => {
//     try {
//         const payments = await Payment.find({
//             user: userId,
//             balanceCurrency: balanceCurrencyId,
//         })
//             .populate(['balanceCurrency', 'payInCurrency'])
//             .sort({ createdAt: 'desc' });

//         return payments;
//     } catch (error) {
//         console.error("Error fetching payments for balance:", error);
//         throw error;
//     }
// };

// const cancelPayment = async (paymentId, userId) => {
//     try { // Add try-catch block for better error logging
//         const payment = await Payment.findById(paymentId).populate(['user', 'balanceCurrency', 'payInCurrency']);
//         if (!payment) {
//             throw new Error('Payment not found.');
//         }

//         console.log("Payment User ID (payment.user._id.toString()):", payment.user._id.toString()); // Log payment.user._id
//         console.log("Request User ID (userId.toString()):", userId.toString());

//         if (payment.user._id.toString() !== userId.toString()) { // Compare payment.user._id
//             throw new Error('Unauthorized cancellation');
//         }

//         if (payment.status !== 'pending' && payment.status !== 'in progress') {
//             throw new Error('Payment cannot be cancelled in its current status.');
//         }

//         payment.status = 'canceled';
//         return await payment.save();
//     } catch (error) {
//         console.error("Error in cancelPayment service:", error); // Log service errors
//         throw error; // Re-throw the error to be caught by the controller
//     }
// };

// const getUserPayments = async (userId) => {
//     return await Payment.find({ user: userId })
//                        .populate(['user', 'balanceCurrency', 'payInCurrency']) // Populate related data
//                        .sort({ createdAt: 'desc' }); // Sort by creation date, newest first
// };

// export default {
//     calculatePaymentSummary,
//     initiatePaymentAndSave,
//     getPaymentDetails,
//     getUserBalancePayments,
//     cancelPayment,
//     getUserPayments, 
// };



import Payment from '../models/Payment.js';
import Currency from '../models/Currency.js';
import Account from '../models/Account.js'; // <-- ADD THIS LINE
import { v4 as uuidv4 } from 'uuid';

const generateReferenceCode = () => {
    return `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
};

const getExchangeRate = async (fromCurrencyCode, toCurrencyCode) => {
    if (fromCurrencyCode === 'EUR' && toCurrencyCode === 'AUD') {
        return 1.717;
    }
    if (fromCurrencyCode === 'AUD' && toCurrencyCode === 'EUR') {
        return 1 / 1.717;
    }
    return 1.0;
};

const calculateFees = async (amount, payInCurrencyCode) => {
    const currency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
    if (!currency) {
        throw new Error('Currency not found for fee calculation.');
    }

    const wiseFeePercentage = currency.wiseFeePercentage || 0;
    const wiseFee = amount * wiseFeePercentage;
    const bankTransferFee = currency.bankTransferFee || 0;

    return { wiseFee, bankTransferFee };
};

const getCurrencyBankDetails = async (payInCurrencyCode) => {
    const currency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });
    if (currency) {
        return {
            payeeName: currency.payeeName,
            iban: currency.iban,
            bicSwift: currency.bicSwift,
            bankAddress: currency.bankAddress,
        };
    }
    return null;
};

const calculatePaymentSummary = async (userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd) => {
    const balanceCurrency = await Currency.findOne({ code: balanceCurrencyCode.toUpperCase() });
    const payInCurrency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });

    if (!balanceCurrency || !payInCurrency) {
        throw new Error('Invalid currency codes.');
    }

    const exchangeRate = await getExchangeRate(payInCurrencyCode, balanceCurrencyCode);
    const fees = await calculateFees(amountToAdd, payInCurrencyCode);
    const amountToPay = (amountToAdd * exchangeRate) + fees.wiseFee + fees.bankTransferFee;

    const paymentSummary = {
        amountToPay,
        exchangeRate,
        wiseFee: fees.wiseFee,
        bankTransferFee: fees.bankTransferFee,
        balanceCurrencyCode,
        payInCurrencyCode,
        amountToAdd,
        userId,
    };

    return paymentSummary;
};

// --- MODIFY initiatePaymentAndSave ---
const initiatePaymentAndSave = async (paymentSummary) => {
    try {
        const { userId, balanceCurrencyCode, payInCurrencyCode, amountToAdd, amountToPay, exchangeRate, wiseFee, bankTransferFee } = paymentSummary;

        const balanceCurrency = await Currency.findOne({ code: balanceCurrencyCode.toUpperCase() });
        const payInCurrency = await Currency.findOne({ code: payInCurrencyCode.toUpperCase() });

        if (!balanceCurrency || !payInCurrency) {
            throw new Error(`Invalid currency code provided: Balance=${balanceCurrencyCode}, PayIn=${payInCurrencyCode}`);
        }

        // --- Find the specific user Account for this currency ---
        const targetAccount = await Account.findOne({ user: userId, currency: balanceCurrency._id });
        if (!targetAccount) {
            // This indicates a potential issue - the user is trying to add money
            // to a currency balance for which they don't have an explicit Account record.
            // How you handle this depends on your application logic.
            // Option 1: Throw error (Safer if Account MUST exist)
             throw new Error(`User ${userId} does not have an account for currency ${balanceCurrencyCode}. Cannot initiate payment.`);
            // Option 2: Log warning and proceed without linking (Payment won't show on Balance Detail)
            // console.warn(`Payment Service: No account found for user ${userId} and currency ${balanceCurrencyCode}. Payment will not be linked to a specific account.`);
        }
        // --- End Finding Account ---


        const referenceCode = generateReferenceCode();
        const bankDetails = await getCurrencyBankDetails(payInCurrencyCode);

        const newPayment = new Payment({
            user: userId,
            // --- Assign the found account ID ---
            account: targetAccount ? targetAccount._id : null, // Store the ObjectId or null
            // --- ---
            balanceCurrency: balanceCurrency._id,
            payInCurrency: payInCurrency._id,
            amountToAdd,
            amountToPay,
            exchangeRate,
            wiseFee,
            bankTransferFee,
            referenceCode,
            bankDetails,
            // status will default to 'pending'
        });

        await newPayment.save();

        // Populate necessary fields for the response, including the account if needed
        // Note: Populating 'account' here might not be necessary if the frontend
        // primarily uses getUserPayments which populates it later.
        return await newPayment.populate(['balanceCurrency', 'payInCurrency']); // Keep it simple for now

    } catch (error) {
        console.error("Error in initiatePaymentAndSave service:", error);
        throw error; // Re-throw to be handled by controller
    }
};

const getPaymentDetails = async (paymentId) => {
    return await Payment.findById(paymentId).populate(['balanceCurrency', 'payInCurrency', 'user', 'account']); // <-- Populate account here too
};

const getUserBalancePayments = async (userId, balanceCurrencyId) => {
    try {
        const payments = await Payment.find({
            user: userId,
            balanceCurrency: balanceCurrencyId,
        })
            .populate(['balanceCurrency', 'payInCurrency'])
            .sort({ createdAt: 'desc' });

        return payments;
    } catch (error) {
        console.error("Error fetching payments for balance:", error);
        throw error;
    }
};

const cancelPayment = async (paymentId, userId) => {
    try { // Add try-catch block for better error logging
        const payment = await Payment.findById(paymentId).populate(['user', 'balanceCurrency', 'payInCurrency']);
        if (!payment) {
            throw new Error('Payment not found.');
        }

        console.log("Payment User ID (payment.user._id.toString()):", payment.user._id.toString()); // Log payment.user._id
        console.log("Request User ID (userId.toString()):", userId.toString());

        if (payment.user._id.toString() !== userId.toString()) { // Compare payment.user._id
            throw new Error('Unauthorized cancellation');
        }

        if (payment.status !== 'pending' && payment.status !== 'in progress') {
            throw new Error('Payment cannot be cancelled in its current status.');
        }

        payment.status = 'canceled';
        return await payment.save();
    } catch (error) {
        console.error("Error in cancelPayment service:", error); // Log service errors
        throw error; // Re-throw the error to be caught by the controller
    }
};

const getUserPayments = async (userId) => {
    try {
        console.log(`Fetching payments for user: ${userId}`); // Add log
         const payments = await Payment.find({ user: userId })
            .populate('user', 'fullName email') // Select specific user fields if needed
            .populate('balanceCurrency', 'code flagImage currencyName') // Populate needed currency fields
            .populate('payInCurrency', 'code flagImage currencyName')   // Populate needed currency fields
            .populate('account', '_id') // Populate only the ID of the account, or more if needed
            .sort({ createdAt: 'desc' })
            .lean(); // Use .lean() for plain JS objects for better performance and easier manipulation

         // --- ADD TYPE FIELD ---
         const paymentsWithType = payments.map(payment => ({
            ...payment,
            type: 'Add Money' // Explicitly add the type for easier frontend filtering
         }));
         // --- END ADD TYPE ---

         console.log(`Found ${paymentsWithType.length} payments for user ${userId}`); // Add log
         return paymentsWithType; // Return the modified array
    } catch (error) {
         console.error(`Error fetching user payments for ${userId}:`, error); // Log specific error
         throw error; // Re-throw
    }
};


// NEW Service: Update status when user confirms transfer
const confirmUserTransfer = async (paymentId, userId) => {
    try {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            throw new Error('Payment not found.');
        }

        // Ensure the user owns this payment
        if (payment.user.toString() !== userId.toString()) {
            throw new Error('Unauthorized action');
        }

        // Only allow update if status is 'pending'
        if (payment.status !== 'pending') {
            // Maybe return the payment as is, or throw error if strict
            // throw new Error('Payment not in pending state.');
            console.warn(`User tried to confirm transfer for payment ${paymentId} with status ${payment.status}. No update performed.`);
            return payment; // Return current payment if not pending
        }

        // Update status to 'in progress'
        payment.status = 'in progress';
        await payment.save();

        // Populate necessary fields for the response if needed
        return await payment.populate(['balanceCurrency', 'payInCurrency']);

    } catch (error) {
        console.error("Error in confirmUserTransfer service:", error);
        throw error; // Re-throw to be handled by controller
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