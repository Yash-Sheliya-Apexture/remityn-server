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


// backend/src/services/exchangeRate.service.js
import axios from 'axios';
import ExchangeRate from '../models/ExchangeRate.js';

const ACCESS_KEY = process.env.EXCHANGE_RATE_API_KEY;
const API_BASE_URL = 'https://api.currencyfreaks.com/v2.0/rates';

const fetchExchangeRatesFromApi = async () => {
    console.log('Service: fetchExchangeRatesFromApi - Function called'); // Add log if you want to debug API fetch
    try {
        const response = await axios.get(`${API_BASE_URL}/latest?apikey=${ACCESS_KEY}`);
        console.log('Service: fetchExchangeRatesFromApi - API Response Status:', response.status); // Log API response status
        console.log('Service: fetchExchangeRatesFromApi - API Response Data:', response.data); // Log API response data
        // currencyfreaks.com API directly returns rates, no 'success' property to check
        return response.data; // Directly return response.data which contains the rates
    } catch (error) {
        console.error('Service: fetchExchangeRatesFromApi - Error fetching exchange rates from API:', error.message, error.response?.status, error.response?.data); // Log detailed error info
        throw error;
    }
};

const updateExchangeRates = async () => {
    console.log('Service: updateExchangeRates - Function called'); // Add log if you want to debug update process
    try {
        const apiData = await fetchExchangeRatesFromApi();
        if (!apiData) { // Check if apiData is null or undefined
            console.warn('Service: updateExchangeRates - No data fetched from API, update aborted.');
            return false;
        }

        // No 'success' property in currencyfreaks response, data is directly the rates
        // We will store the entire response as 'rates' and can add other metadata if needed.
        await ExchangeRate.findOneAndUpdate(
            { date: new Date().toISOString().split('T')[0] }, // Use current date as date identifier for currencyfreaks API
            {
                base: 'EUR', // Assuming base currency is EUR from currencyfreaks based on common practice, adjust if needed. CurrencyFreaks does not explicitly state base in this API endpoint.
                date: new Date().toISOString().split('T')[0], // Store current date
                rates: apiData, // Store the entire response data as rates
                timestamp: Math.floor(Date.now() / 1000), // Using current timestamp as currencyfreaks does not provide timestamp in this endpoint
                updatedAt: Date.now()
            },
            { upsert: true, setDefaultsOnInsert: true, new: true }
        );

        console.log('Service: updateExchangeRates - Exchange rates updated successfully in MongoDB');
        return true;
    } catch (error) {
        console.error('Service: updateExchangeRates - Error updating exchange rates in MongoDB:', error);
        return false;
    }
};

const getLatestExchangeRates = async () => {
    console.log('Service: getLatestExchangeRates - Function called'); // Log at the start of the service function
    try {
        // Find the latest document, sorting by updatedAt in descending order
        const latestRates = await ExchangeRate.findOne().sort({ updatedAt: -1 });
        console.log('Service: getLatestExchangeRates - Data from MongoDB:', latestRates); // Log data from MongoDB
        return latestRates;
    } catch (error) {
        console.error('Service: getLatestExchangeRates - Error fetching from MongoDB:', error); // Log MongoDB errors
        throw error;
    } finally {
        console.log('Service: getLatestExchangeRates - Function end'); // Log at the end
    }
};

export default {
    fetchExchangeRatesFromApi,
    updateExchangeRates,
    getLatestExchangeRates,
};
