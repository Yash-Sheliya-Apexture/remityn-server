// backend/src/services/account.service.js
import Account from '../models/Account.js';
import Currency from '../models/Currency.js';

const getUserAccounts = async (userId) => {
    return await Account.find({ user: userId }).populate('currency'); // Populate currency details
};

const addCurrencyAccount = async (userId, currencyCode) => {
    // 1. Check if the currency code exists in the Currency model
    const currency = await Currency.findOne({ code: currencyCode.toUpperCase() });
    if (!currency) {
        throw new Error('Invalid currency code.'); // Or use custom error class
    }

    // 2. Check if the user already has an account for this currency
    const existingAccount = await Account.findOne({ user: userId, currency: currency._id });
    if (existingAccount) {
        throw new Error('Account for this currency already exists.');
    }

    // 3. Create a new account
    const newAccount = new Account({
        user: userId,
        currency: currency._id,
    });
    await newAccount.save();
    return await newAccount.populate('currency'); // Populate currency details in the response
};


const getAccountById = async (balanceId) => {
    return await Account.findById(balanceId).populate('currency'); // Populate currency details
};


export default {
    getUserAccounts,
    addCurrencyAccount,
    getAccountById,
};