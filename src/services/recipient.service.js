// backend/src/services/recipient.service.js
import Recipient from '../models/Recipient.js';
import Currency from '../models/Currency.js';

const addRecipient = async (recipientData) => {
    const { currencyCode, ...restData } = recipientData;

    // Find the Currency document based on currencyCode
    const currency = await Currency.findOne({ code: currencyCode.toUpperCase() });
    if (!currency) {
        throw new Error('Invalid currency code.');
    }

    const newRecipient = new Recipient({
        ...restData,
        currency: currency._id, // Assign the currency ObjectId
    });
    await newRecipient.save();
    return await newRecipient.populate('currency'); // Populate currency details in response
};

const getUserRecipients = async (userId) => {
    return await Recipient.find({ user: userId }).populate('currency');
};

const getRecipientById = async (recipientId) => {
    return await Recipient.findById(recipientId).populate('currency');
};

const updateRecipient = async (recipientId, updateData) => {
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