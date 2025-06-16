// // backend/src/models/ExchangeRate.js
// import mongoose from 'mongoose';
// import { Schema } from 'mongoose'; // **Import Schema here**

// const exchangeRateSchema = new mongoose.Schema({
//     base: { type: String },
//     date: { type: String },
//     rates: { type: Schema.Types.Mixed }, // Store the rates object as Mixed type
//     timestamp: { type: Number },
//     updatedAt: { type: Date, default: Date.now }, // Add updatedAt to track last update time
// });

// const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

// export default ExchangeRate;


// backend/src/models/ExchangeRate.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const exchangeRateSchema = new mongoose.Schema({
    base: { type: String, required: true, default: 'INR' }, // Explicitly define base, defaulting to INR
    // date: { type: String }, // Can remove if you only need timestamp
    rates: { type: Schema.Types.Mixed, required: true }, // Store the scraped rates object here { CURRENCY_CODE: rate, ... }
    timestamp: { type: Number, required: true, unique: true, index: true }, // Unix timestamp, add index for faster sorting
    // createdAt and updatedAt are added automatically by { timestamps: true }
}, { timestamps: true }); // Add Mongoose timestamps for createdAt and updatedAt

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

export default ExchangeRate;