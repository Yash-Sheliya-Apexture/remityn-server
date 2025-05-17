// // backend/src/services/recipient.service.js
// import Recipient from '../models/Recipient.js';
// import Currency from '../models/Currency.js';

// const addRecipient = async (recipientData) => {
//     const { currencyCode, ...restData } = recipientData;

//     // Find the Currency document based on currencyCode
//     const currency = await Currency.findOne({ code: currencyCode.toUpperCase() });
//     if (!currency) {
//         throw new Error('Invalid currency code.');
//     }

//     const newRecipient = new Recipient({
//         ...restData,
//         currency: currency._id, // Assign the currency ObjectId
//     });
//     await newRecipient.save();
//     return await newRecipient.populate('currency'); // Populate currency details in response
// };

// const getUserRecipients = async (userId) => {
//     return await Recipient.find({ user: userId }).populate('currency');
// };

// const getRecipientById = async (recipientId) => {
//     return await Recipient.findById(recipientId).populate('currency');
// };

// const updateRecipient = async (recipientId, updateData) => {
//     return await Recipient.findByIdAndUpdate(recipientId, updateData, { new: true }).populate('currency');
// };

// const deleteRecipient = async (recipientId) => {
//     return await Recipient.findByIdAndDelete(recipientId);
// };


// export default {
//     addRecipient,
//     getUserRecipients,
//     getRecipientById,
//     updateRecipient,
//     deleteRecipient,
// };


// backend/src/services/recipient.service.js
import Recipient from '../models/Recipient.js';
import Currency from '../models/Currency.js';
import AppError from '../utils/AppError.js'; // Make sure you have this utility or adapt

const addRecipient = async (recipientData) => {
    const { currencyCode, accountNumber, user: userId, ...restData } = recipientData;

    // 1. Find the Currency document
    const currency = await Currency.findOne({ code: currencyCode.toUpperCase() });
    if (!currency) {
        // This error should ideally be prevented by frontend logic,
        // but it's good to have a backend check.
        throw new AppError('Invalid currency selected.', 400);
    }

    // 2. Check for existing recipient with the same account number and currency for THIS user
    const existingRecipient = await Recipient.findOne({
        user: userId,               // Check for the current user
        accountNumber: accountNumber.trim(), // Use the trimmed account number
        currency: currency._id,     // Check against the currency's ObjectId
    });

    if (existingRecipient) {
        // If a recipient exists, throw a conflict error
        throw new AppError(
            `You already have a recipient with account number '${accountNumber}' for ${currencyCode} currency.`,
            409 // HTTP 409 Conflict
        );
    }

    // 3. Create and save the new recipient
    const newRecipient = new Recipient({
        ...restData,
        accountNumber: accountNumber.trim(), // Store trimmed account number
        user: userId,
        currency: currency._id,
    });
    await newRecipient.save();
    return await newRecipient.populate('currency');
};

// Other service functions (getUserRecipients, getRecipientById, etc.) remain the same...
const getUserRecipients = async (userId) => {
    return await Recipient.find({ user: userId }).populate('currency');
};

const getRecipientById = async (recipientId) => {
    return await Recipient.findById(recipientId).populate('currency');
};

const updateRecipient = async (recipientId, updateData) => {
    // If allowing account number updates, you might need a similar check here.
    return await Recipient.findByIdAndUpdate(recipientId, updateData, { new: true }).populate('currency');
};

const deleteRecipient = async (recipientId) => {
    return await Recipient.findByIdAndDelete(recipientId);
};

export default {
    addRecipient,
    getUserRecipients,
    getRecipientById,
    updateRecipient,
    deleteRecipient,
};