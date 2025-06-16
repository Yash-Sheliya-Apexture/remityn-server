// // backend/src/services/currency.service.js
// import Currency from '../models/Currency.js';

// const getAllCurrencies = async () => {
//     return await Currency.find();
// };

// export default {
//     getAllCurrencies,
// };

// // backend/src/services/currency.service.js
// import Currency from '../models/Currency.js';

// // Include 'rateAdjustmentPercentage' instead of 'customRateToBase'
// const getAllCurrencies = async (includeRates = false) => {
//     const selection = 'code currencyName flagImage' + (includeRates ? ' rateAdjustmentPercentage' : '');
//     return await Currency.find().select(selection).sort({ code: 1 });
// };

// export default {
//     getAllCurrencies,
// };

// backend/src/services/currency.service.js - Make sure it looks like this
import Currency from '../models/Currency.js';

const getAllCurrencies = async (includeRates = false) => {
    // MODIFIED: Select fee fields when includeRates is true
    const selection = 'code currencyName flagImage' +
                      (includeRates ? ' rateAdjustmentPercentage remitynFeePercentage bankTransferFee' : ''); // Ensure these are selected
    // Ensure sorting if needed, e.g., by code
    return await Currency.find().select(selection).sort({ code: 1 });
};

export default {
    getAllCurrencies,
};