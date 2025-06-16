// // backend/src/controllers/exchangeRate.controller.js
// import exchangeRateService from '../services/exchangeRate.service.js';

// const getExchangeRates = async (req, res, next) => {
//     console.log('Controller: getExchangeRates - Start'); // Log at the start of the controller
//     try {
//         const exchangeRatesData = await exchangeRateService.getLatestExchangeRates();
//         console.log('Controller: getExchangeRates - Data from service:', exchangeRatesData); // Log data from service

//         if (!exchangeRatesData) {
//             console.log('Controller: getExchangeRates - No data found in service, sending 404'); // Log if no data
//             return res.status(404).json({ message: 'Exchange rates data not found. Please try again later.' });
//         }

//         console.log('Controller: getExchangeRates - Sending rates to frontend:', exchangeRatesData.rates); // Log rates being sent
//         res.json({ rates: exchangeRatesData.rates }); // Send the rates object within an object
//     } catch (error) {
//         console.error('Controller: getExchangeRates - Error:', error); // Log any errors
//         next(error);
//     } finally {
//         console.log('Controller: getExchangeRates - End'); // Log at the end of the controller
//     }
// };

// export default {
//     getExchangeRates,
// };

// // backend/src/controllers/exchangeRate.controller.js
// import exchangeRateService from '../services/exchangeRate.service.js';

// const getExchangeRates = async (req, res, next) => {
//     console.log('Controller: getExchangeRates - Start'); // Log at the start of the controller
//     try {
//         const exchangeRatesData = await exchangeRateService.getLatestExchangeRates();
//         console.log('Controller: getExchangeRates - Data from service:', exchangeRatesData); // Log data from service

//         if (!exchangeRatesData || !exchangeRatesData.rates) { // Check if exchangeRatesData or exchangeRatesData.rates is null/undefined
//             console.log('Controller: getExchangeRates - No data found in service or rates are missing, sending 404'); // Log if no data or rates missing
//             return res.status(404).json({ message: 'Exchange rates data not found. Please try again later.' });
//         }

//         console.log('Controller: getExchangeRates - Sending rates to frontend:', exchangeRatesData.rates); // Log rates being sent
//         res.json({ rates: exchangeRatesData.rates }); // Send the rates object within an object
//     } catch (error) {
//         console.error('Controller: getExchangeRates - Error:', error); // Log any errors
//         next(error);
//     } finally {
//         console.log('Controller: getExchangeRates - End'); // Log at the end of the controller
//     }
// };



// export default {
//     getExchangeRates,
// };


// import exchangeRateService from '../services/exchangeRate.service.js';

// const getExchangeRates = async (req, res, next) => {
//     console.log('Controller: getExchangeRates - Start');
//     try {
//         const exchangeRatesData = await exchangeRateService.getLatestExchangeRates();
//         console.log('Controller: getExchangeRates - Data from service:', exchangeRatesData);

//         // --- MODIFICATION START ---
//         // Check if the data structure and the nested rates object exist
//         if (exchangeRatesData && // Check if data exists
//             exchangeRatesData.rates && // Check if the outer 'rates' field (from DB) exists
//             typeof exchangeRatesData.rates === 'object' && // Ensure it's an object
//             exchangeRatesData.rates.rates && // Check if the NESTED 'rates' field (from API structure) exists
//             typeof exchangeRatesData.rates.rates === 'object') // Ensure the nested one is an object
//         {
//             // Extract the NESTED rates object which contains { USD: x, INR: y, ... }
//             const actualRates = exchangeRatesData.rates.rates;
//             console.log('Controller: getExchangeRates - Sending NESTED rates to frontend:', actualRates);
//             // Send the actual rates object under the 'rates' key
//             res.json({ rates: actualRates });
//         } else {
//             // Log the problematic structure if validation fails
//             console.log('Controller: getExchangeRates - Nested rates object not found or data structure invalid:', exchangeRatesData);
//             // Send a more specific error message
//             return res.status(404).json({ message: 'Exchange rates data format is invalid or rates are missing.' });
//         }
//         // --- MODIFICATION END ---

//     } catch (error) {
//         console.error('Controller: getExchangeRates - Error:', error);
//         next(error);
//     } finally {
//         console.log('Controller: getExchangeRates - End');
//     }
// };

// export default {
//     getExchangeRates,
// };

// backend/src/controllers/exchangeRate.controller.js
import exchangeRateService from '../services/exchangeRate.service.js';
import AppError from '../utils/AppError.js'; // Ensure AppError is imported if used

const getExchangeRates = async (req, res, next) => {
    console.log('Controller: getExchangeRates - Start');
    try {
        // getLatestExchangeRates service now returns the full document or null
        const latestExchangeRateDoc = await exchangeRateService.getLatestExchangeRates();
        console.log('Controller: getExchangeRates - Document from service received.'); // Log receipt, not content

        if (!latestExchangeRateDoc || !latestExchangeRateDoc.rates || typeof latestExchangeRateDoc.rates !== 'object' || Object.keys(latestExchangeRateDoc.rates).length === 0) {
             console.log('Controller: getExchangeRates - No latest rates document or invalid/empty format found.');
             // Send a 404 or appropriate error if no data is available
             // Use AppError for consistent error handling if your middleware uses it
             return next(new AppError('Exchange rates data not found or available yet.', 404));
             // Or simple JSON response:
             // return res.status(404).json({ message: 'Exchange rates data not found or available yet.' });
        }

        // The scraped rates object is stored directly in the 'rates' field of the document
        const actualRates = latestExchangeRateDoc.rates;
        console.log('Controller: getExchangeRates - Sending scraped rates object to frontend.');

        // Send the actual scraped rates object under the 'rates' key,
        // matching the structure the frontend service expects { rates: { ... } }
        res.json({ rates: actualRates });

    } catch (error) {
        console.error('Controller: getExchangeRates - Error:', error);
        next(error); // Pass errors to the global error handler
    } finally {
        console.log('Controller: getExchangeRates - End');
    }
};

export default {
    getExchangeRates,
};