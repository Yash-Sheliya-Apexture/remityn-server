import dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/utils/database.js';
import Currency from './src/models/Currency.js';

const currenciesToSeed = [
    { code: 'USD', wiseFeePercentage: 0.002, bankTransferFee: 0.7, payeeName: 'Wise US Inc', iban: 'US999876543210', bicSwift: 'WFBIUS6SXXX', bankAddress: '123 Main Street, New York, NY 10001, USA' }, // Example with fees and bank details
    { code: 'EUR', wiseFeePercentage: 0.0015, bankTransferFee: 0, payeeName: 'Wise Europe SA', iban: 'BE79967040785533', bicSwift: 'TRWIBEB1XXX', bankAddress: 'Wise Europe SA/NV Rue Du Trône 100, box 3 Brussels 1050' }, // Example with fees and bank details
    { code: 'GBP', wiseFeePercentage: 0.0025, bankTransferFee: 0.5, payeeName: 'Wise Ltd', iban: 'GB29NWBK60161331926819', bicSwift: 'NWBKGB2LXXX', bankAddress: '56 Shoreditch High Street, London E1 6JE, United Kingdom' }, // Example with fees and bank details
    { code: 'INR', wiseFeePercentage: 0, bankTransferFee: 1.0, payeeName: 'Wise India', iban: 'IN82SBIN0000001234567890', bicSwift: 'SBININBBXXX', bankAddress: 'State Bank of India, Mumbai, India' }, // Example with fees and bank details
    { code: 'AED', wiseFeePercentage: 0.0022, bankTransferFee: 0.8, payeeName: 'Wise AE', iban: 'AE070330000019876543210', bicSwift: 'BOMLAEADXXX', bankAddress: 'Bank of Baroda, Dubai, UAE' }, // Example with fees and bank details
    { code: 'CAD', wiseFeePercentage: 0.0021, bankTransferFee: 0.6, payeeName: 'Wise CA Inc', iban: 'CA120001234567890123456', bicSwift: 'CIBCCATTXXX', bankAddress: 'CIBC, Toronto, Canada' }, // Example with fees and bank details
    { code: 'AUD', wiseFeePercentage: 0.0018, bankTransferFee: 0.4, payeeName: 'Wise Payments Australia Pty Ltd', iban: 'AU781234560000123456789', bicSwift: 'WPAYAU2SXXX', bankAddress: 'Westpac, Sydney, Australia' }, // Example with fees and bank details
    { code: 'CNY', wiseFeePercentage: 0.0028, bankTransferFee: 1.2, payeeName: 'Wise China', iban: 'CN121000000000123456789', bicSwift: 'BKCHCNBJXXX', bankAddress: 'Bank of China, Beijing, China' }, // Example with fees and bank details
    { code: 'JPY', wiseFeePercentage: 0.001, bankTransferFee: 0.2, payeeName: 'Wise Japan KK', iban: 'JP121000000000123456789', bicSwift: 'BOTKJPJTXXX', bankAddress: 'Bank of Tokyo-Mitsubishi UFJ, Tokyo, Japan' },  // Example with fees and bank details
];

const seedCurrencies = async () => {
    try {
        await connectDB();
        await Currency.deleteMany({}); // Clear existing currencies
        await Currency.insertMany(currenciesToSeed);
        console.log('Currencies seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding currencies:', error);
        process.exit(1);
    }
};

seedCurrencies();