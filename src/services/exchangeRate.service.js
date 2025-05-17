// // backend/src/services/exchangeRate.service.js
// import axios from 'axios';
// import ExchangeRate from '../models/ExchangeRate.js';

// const ACCESS_KEY = process.env.EXCHANGE_RATE_API_KEY;
// const API_BASE_URL = 'https://api.currencyfreaks.com/v2.0/rates';

// const fetchExchangeRatesFromApi = async () => {
//     // ... (your existing fetchExchangeRatesFromApi function - you can add logs here too if needed) ...
//     console.log('Service: fetchExchangeRatesFromApi - Function called'); // Add log if you want to debug API fetch
//     try {
//         const response = await axios.get(`${API_BASE_URL}/latest?apikey=${ACCESS_KEY}`);
//         // currencyfreaks.com API directly returns rates, no 'success' property to check
//         return response.data; // Directly return response.data which contains the rates
//     } catch (error) {
//         console.error('Error fetching exchange rates from API:', error);
//         throw error;
//     }
// };

// const updateExchangeRates = async () => {
//     // ... (your existing updateExchangeRates function - you can add logs here too if needed) ...
//     console.log('Service: updateExchangeRates - Function called'); // Add log if you want to debug update process
//     try {
//         const apiData = await fetchExchangeRatesFromApi();

//         // No 'success' property in currencyfreaks response, data is directly the rates
//         // We will store the entire response as 'rates' and can add other metadata if needed.
//         await ExchangeRate.findOneAndUpdate(
//             { date: new Date().toISOString().split('T')[0] }, // Use current date as date identifier for currencyfreaks API
//             {
//                 base: 'EUR', // Assuming base currency is EUR from currencyfreaks based on common practice, adjust if needed. CurrencyFreaks does not explicitly state base in this API endpoint.
//                 date: new Date().toISOString().split('T')[0], // Store current date
//                 rates: apiData, // Store the entire response data as rates
//                 timestamp: Math.floor(Date.now() / 1000), // Using current timestamp as currencyfreaks does not provide timestamp in this endpoint
//                 updatedAt: Date.now()
//             },
//             { upsert: true, setDefaultsOnInsert: true, new: true }
//         );

//         console.log('Exchange rates updated successfully in MongoDB');
//         return true;
//     } catch (error) {
//         console.error('Error updating exchange rates in MongoDB:', error);
//         return false;
//     }
// };

// const getLatestExchangeRates = async () => {
//     console.log('Service: getLatestExchangeRates - Function called'); // Log at the start of the service function
//     try {
//         // Find the latest document, sorting by updatedAt in descending order
//         const latestRates = await ExchangeRate.findOne().sort({ updatedAt: -1 });
//         console.log('Service: getLatestExchangeRates - Data from MongoDB:', latestRates); // Log data from MongoDB
//         return latestRates;
//     } catch (error) {
//         console.error('Service: getLatestExchangeRates - Error fetching from MongoDB:', error); // Log MongoDB errors
//         throw error;
//     } finally {
//         console.log('Service: getLatestExchangeRates - Function end'); // Log at the end
//     }
// };

// export default {
//     fetchExchangeRatesFromApi,
//     updateExchangeRates,
//     getLatestExchangeRates,
// };


// // backend/src/services/exchangeRate.service.js
// import axios from 'axios';
// import ExchangeRate from '../models/ExchangeRate.js';

// const ACCESS_KEY = process.env.EXCHANGE_RATE_API_KEY;
// const API_BASE_URL = 'https://api.currencyfreaks.com/v2.0/rates';

// const fetchExchangeRatesFromApi = async () => {
//     console.log('Service: fetchExchangeRatesFromApi - Function called'); // Add log if you want to debug API fetch
//     try {
//         const response = await axios.get(`${API_BASE_URL}/latest?apikey=${ACCESS_KEY}`);
//         console.log('Service: fetchExchangeRatesFromApi - API Response Status:', response.status); // Log API response status
//         console.log('Service: fetchExchangeRatesFromApi - API Response Data:', response.data); // Log API response data
//         // currencyfreaks.com API directly returns rates, no 'success' property to check
//         return response.data; // Directly return response.data which contains the rates
//     } catch (error) {
//         console.error('Service: fetchExchangeRatesFromApi - Error fetching exchange rates from API:', error.message, error.response?.status, error.response?.data); // Log detailed error info
//         throw error;
//     }
// };

// const updateExchangeRates = async () => {
//     console.log('Service: updateExchangeRates - Function called'); // Add log if you want to debug update process
//     try {
//         const apiData = await fetchExchangeRatesFromApi();
//         if (!apiData) { // Check if apiData is null or undefined
//             console.warn('Service: updateExchangeRates - No data fetched from API, update aborted.');
//             return false;
//         }

//         // No 'success' property in currencyfreaks response, data is directly the rates
//         // We will store the entire response as 'rates' and can add other metadata if needed.
//         await ExchangeRate.findOneAndUpdate(
//             { date: new Date().toISOString().split('T')[0] }, // Use current date as date identifier for currencyfreaks API
//             {
//                 base: 'EUR', // Assuming base currency is EUR from currencyfreaks based on common practice, adjust if needed. CurrencyFreaks does not explicitly state base in this API endpoint.
//                 date: new Date().toISOString().split('T')[0], // Store current date
//                 rates: apiData, // Store the entire response data as rates
//                 timestamp: Math.floor(Date.now() / 1000), // Using current timestamp as currencyfreaks does not provide timestamp in this endpoint
//                 updatedAt: Date.now()
//             },
//             { upsert: true, setDefaultsOnInsert: true, new: true }
//         );

//         console.log('Service: updateExchangeRates - Exchange rates updated successfully in MongoDB');
//         return true;
//     } catch (error) {
//         console.error('Service: updateExchangeRates - Error updating exchange rates in MongoDB:', error);
//         return false;
//     }
// };

// const getLatestExchangeRates = async () => {
//     console.log('Service: getLatestExchangeRates - Function called'); // Log at the start of the service function
//     try {
//         // Find the latest document, sorting by updatedAt in descending order
//         const latestRates = await ExchangeRate.findOne().sort({ updatedAt: -1 });
//         console.log('Service: getLatestExchangeRates - Data from MongoDB:', latestRates); // Log data from MongoDB
//         return latestRates;
//     } catch (error) {
//         console.error('Service: getLatestExchangeRates - Error fetching from MongoDB:', error); // Log MongoDB errors
//         throw error;
//     } finally {
//         console.log('Service: getLatestExchangeRates - Function end'); // Log at the end
//     }
// };

// export default {
//     fetchExchangeRatesFromApi,
//     updateExchangeRates,
//     getLatestExchangeRates,
// };


// backend/src/services/exchangeRate.service.js
// Remove axios
// import axios from 'axios';
import ExchangeRate from '../models/ExchangeRate.js';
import Currency from '../models/Currency.js'; // Import the Currency model
import scrapeAllRatesAgainstINR from '../utils/scrapeAllRatesAgainstINR.js'; // Import the new scraper

// No API key needed anymore
// const ACCESS_KEY = process.env.EXCHANGE_RATE_API_KEY;
// const API_BASE_URL = 'https://api.currencyfreaks.com/v2.0/rates';

const updateExchangeRates = async () => {
    console.log('Service: updateExchangeRates - Function called to scrape and save all rates against INR');
    try {
        // 1. Get list of target currency codes from your Currency model
        const currencies = await Currency.find({ code: { $ne: 'INR' } }).select('code').lean(); // Get all currencies except INR, just their codes
        const targetCurrencyCodes = currencies.map(c => c.code);

        if (targetCurrencyCodes.length === 0) {
            console.warn('Service: updateExchangeRates - No target currencies found in the database (excluding INR). Aborting scrape.');
            return false;
        }

        console.log(`Service: updateExchangeRates - Found ${targetCurrencyCodes.length} target currencies: ${targetCurrencyCodes.join(', ')}`);

        // 2. Call the scraper with the list of codes
        const scrapedRates = await scrapeAllRatesAgainstINR(targetCurrencyCodes);

        // Check for successful scrape before proceeding
        // FIX START: Corrected typo from 'scapedRates' to 'scrapedRates'
        if (!scrapedRates || Object.keys(scrapedRates).length === 0) {
        // FIX END: Corrected typo
            console.warn('Service: updateExchangeRates - No rates scraped successfully. Aborting save.');
            return false; // Indicate no update occurred because scraping failed
        }

        // 3. Save the results to the database
        // We will save a new document for each scrape run (every minute)
        const newRateEntry = new ExchangeRate({
            base: 'INR', // Explicitly set base currency
            rates: scrapedRates, // Store the object { USD: x, EUR: y, ... }
            timestamp: Math.floor(Date.now() / 1000), // Unix timestamp of scrape time
            // createdAt and updatedAt will be added by Mongoose timestamps option
        });

        await newRateEntry.save();

        console.log(`Service: updateExchangeRates - Scraped rates saved successfully to MongoDB. Scraped ${Object.keys(scrapedRates).length} currencies.`);
        return true; // Indicate success

    } catch (error) {
        console.error('Service: updateExchangeRates - Error during update process:', error);
        // Log the specific error for debugging
        return false; // Indicate failure
    }
};

const getLatestExchangeRates = async () => {
    console.log('Service: getLatestExchangeRates - Function called');
    try {
        // Find the latest document based on the timestamp or createdAt field
        const latestRatesDoc = await ExchangeRate.findOne().sort({ createdAt: -1 }).exec(); // Use createdAt as it's set on creation

        if (!latestRatesDoc) {
            console.log('Service: getLatestExchangeRates - No rates found in DB.');
            return null; // Indicate no data found
        }

        console.log('Service: getLatestExchangeRates - Found latest rates document.');
        // Return the document as is. The controller will extract the 'rates' field.
        return latestRatesDoc;

    } catch (error) {
        console.error('Service: getLatestExchangeRates - Error fetching from MongoDB:', error);
        throw error; // Re-throw database errors
    } finally {
        console.log('Service: getLatestExchangeRates - Function end');
    }
};

export default {
    updateExchangeRates,
    getLatestExchangeRates,
    // Add other exports if needed (e.g. for currency service)
};