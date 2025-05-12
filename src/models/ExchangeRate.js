// backend/src/models/ExchangeRate.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose'; // **Import Schema here**

const exchangeRateSchema = new mongoose.Schema({
    base: { type: String },
    date: { type: String },
    rates: { type: Schema.Types.Mixed }, // Store the rates object as Mixed type
    timestamp: { type: Number },
    updatedAt: { type: Date, default: Date.now }, // Add updatedAt to track last update time
});

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

export default ExchangeRate;