// // backend/src/services/admin/currency.admin.service.js
// import Currency from '../../models/Currency.js';

// const getAllCurrenciesAdmin = async () => {
//     return await Currency.find();
// };

// const getCurrencyByIdAdmin = async (currencyId) => {
//     return await Currency.findById(currencyId);
// };

// const createCurrencyAdmin = async ({ code, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, flagImage, currencyName }) => { // Accept new fields
//     if (!code) {
//         throw new Error('Currency code is required.');
//     }
//     const existingCurrency = await Currency.findOne({ code: code.toUpperCase() });
//     if (existingCurrency) {
//         throw new Error('Currency with this code already exists.');
//     }
//     const newCurrency = new Currency({
//         code: code.toUpperCase(),
//         payeeName,
//         iban,
//         bicSwift,
//         bankAddress,
//         wiseFeePercentage,
//         bankTransferFee,
//         flagImage,
//         currencyName,
//     });
//     await newCurrency.save();
//     return newCurrency;
// };

// const updateCurrencyAdmin = async (currencyId, { code, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, flagImage, currencyName }) => { // Accept new fields
//     if (!code) {
//         throw new Error('Currency code is required.');
//     }
//     const currency = await Currency.findById(currencyId);
//     if (!currency) {
//         throw new Error('Currency not found.');
//     }
//     currency.code = code.toUpperCase();
//     currency.payeeName = payeeName;
//     currency.iban = iban;
//     currency.bicSwift = bicSwift;
//     currency.bankAddress = bankAddress;
//     currency.wiseFeePercentage = wiseFeePercentage;
//     currency.bankTransferFee = bankTransferFee;
//     currency.flagImage = flagImage; // Update flag image
//     currency.currencyName = currencyName; // Update currency name
//     await currency.save();
//     return currency;
// };

// const deleteCurrencyAdmin = async (currencyId) => {
//     const currency = await Currency.findById(currencyId);
//     if (!currency) {
//         throw new Error('Currency not found.');
//     }
//     await Currency.findByIdAndDelete(currencyId);
// };

// export default {
//     getAllCurrenciesAdmin,
//     getCurrencyByIdAdmin,
//     createCurrencyAdmin,
//     updateCurrencyAdmin,
//     deleteCurrencyAdmin,
// };


// backend/src/services/admin/currency.admin.service.js
import Currency from '../../models/Currency.js';

const getAllCurrenciesAdmin = async () => {
    // Optionally sort by code or name
    return await Currency.find().sort({ code: 1 });
};

const getCurrencyByIdAdmin = async (currencyId) => {
    return await Currency.findById(currencyId);
};

const createCurrencyAdmin = async ({ code, currencyName, flagImage, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, rateAdjustmentPercentage }) => {
    if (!code || !currencyName) {
        throw new Error('Currency code and name are required.');
    }
    const upperCaseCode = code.toUpperCase().trim();
    if (upperCaseCode.length !== 3) {
        throw new Error('Currency code must be exactly 3 characters long.');
    }

    const existingCurrency = await Currency.findOne({ code: upperCaseCode });
    if (existingCurrency) {
        throw new Error(`Currency with code ${upperCaseCode} already exists.`);
    }

    // Validate rateAdjustmentPercentage if provided
    let adjustment = 0; // Default to 0
    if (rateAdjustmentPercentage !== undefined && rateAdjustmentPercentage !== null && rateAdjustmentPercentage !== '') {
        adjustment = parseFloat(rateAdjustmentPercentage);
        if (isNaN(adjustment)) {
            throw new Error('Rate Adjustment Percentage must be a valid number.');
        }
        // Optional: Add range validation if needed (e.g., adjustment > -10 && adjustment < 20)
    }

    const newCurrency = new Currency({
        code: upperCaseCode,
        currencyName: currencyName.trim(),
        flagImage: flagImage?.trim(),
        payeeName: payeeName?.trim(),
        iban: iban?.trim(),
        bicSwift: bicSwift?.trim(),
        bankAddress: bankAddress?.trim(),
        wiseFeePercentage: wiseFeePercentage ?? 0,
        bankTransferFee: bankTransferFee ?? 0,
        rateAdjustmentPercentage: adjustment, // Store parsed adjustment or default 0
    });
    await newCurrency.save();
    return newCurrency;
};

// Updated update function
const updateCurrencyAdmin = async (currencyId, updateData) => {
    const { code, currencyName, flagImage, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, rateAdjustmentPercentage } = updateData; // Destructure new field

    const currency = await Currency.findById(currencyId);
    if (!currency) {
        throw new Error('Currency not found.');
    }

    // Update standard fields
    if (code) { /* ... code validation and update ... */ }
    if (currencyName) currency.currencyName = currencyName.trim();
    if (flagImage !== undefined) currency.flagImage = flagImage?.trim();
    if (payeeName !== undefined) currency.payeeName = payeeName?.trim();
    if (iban !== undefined) currency.iban = iban?.trim();
    if (bicSwift !== undefined) currency.bicSwift = bicSwift?.trim();
    if (bankAddress !== undefined) currency.bankAddress = bankAddress?.trim();
    if (wiseFeePercentage !== undefined) currency.wiseFeePercentage = wiseFeePercentage ?? 0;
    if (bankTransferFee !== undefined) currency.bankTransferFee = bankTransferFee ?? 0;

    // Validate and update rateAdjustmentPercentage if provided
    if (rateAdjustmentPercentage !== undefined) {
         let adjustment = 0; // Default to 0 if cleared
         if (rateAdjustmentPercentage !== null && rateAdjustmentPercentage !== '') {
             adjustment = parseFloat(rateAdjustmentPercentage);
             if (isNaN(adjustment)) {
                 throw new Error('Rate Adjustment Percentage must be a valid number.');
             }
             // Optional range validation
         }
         currency.rateAdjustmentPercentage = adjustment;
    }

    await currency.save();
    return currency;
};


const deleteCurrencyAdmin = async (currencyId) => {
    const result = await Currency.findByIdAndDelete(currencyId);
    if (!result) {
        throw new Error('Currency not found.');
    }
    // Consider checking if the currency is used in Accounts or Transfers before deleting
    // For simplicity, direct deletion is implemented here.
};

export default {
    getAllCurrenciesAdmin,
    getCurrencyByIdAdmin,
    createCurrencyAdmin,
    updateCurrencyAdmin,
    deleteCurrencyAdmin,
};