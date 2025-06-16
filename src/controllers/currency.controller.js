// import currencyService from '../services/currency.service.js';

// const getAllCurrencies = async (req, res, next) => {
//     try {
//         const currencies = await currencyService.getAllCurrencies();
//         res.json(currencies);
//     } catch (error) {
//         next(error);
//     }
// };

// export default {
//     getAllCurrencies,
// };


// backend/src/controllers/currency.controller.js
import currencyService from '../services/currency.service.js';

const getAllCurrencies = async (req, res, next) => {
    try {
        // Check for a query parameter, e.g., /api/currencies?rates=true
        const includeRates = req.query.rates === 'true';
        const currencies = await currencyService.getAllCurrencies(includeRates);
        res.json(currencies);
    } catch (error) {
        next(error);
    }
};

export default {
    getAllCurrencies,
};