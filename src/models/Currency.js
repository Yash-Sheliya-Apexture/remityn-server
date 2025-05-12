// // backend/src/models/Currency.js
// import mongoose from 'mongoose';

// const currencySchema = new mongoose.Schema({
//     code: { type: String, required: true, unique: true, uppercase: true },
//     payeeName: { type: String },
//     iban: { type: String },
//     bicSwift: { type: String },
//     bankAddress: { type: String },
//     wiseFeePercentage: { type: Number, default: 0 },
//     bankTransferFee: { type: Number, default: 0 },
//     flagImage: { type: String }, // Add flag image field
//     currencyName: { type: String }, // Add currency name field
//     // You can add more fields or customize as needed
// });

// const Currency = mongoose.model('Currency', currencySchema);

// export default Currency;


// backend/src/models/Currency.js
import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 3, maxlength: 3 },
    currencyName: { type: String, required: true, trim: true },
    flagImage: { type: String, trim: true },
    // Bank Details
    payeeName: { type: String, trim: true },
    iban: { type: String, trim: true },
    bicSwift: { type: String, trim: true },
    bankAddress: { type: String, trim: true },
    // Fees
    wiseFeePercentage: { type: Number, default: 0, min: 0 },
    bankTransferFee: { type: Number, default: 0, min: 0 },
    // Default is 0 (no adjustment).
    rateAdjustmentPercentage: { type: Number, default: 0 }, // Changed from customRateToBase
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

currencySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Currency = mongoose.model('Currency', currencySchema);

export default Currency;