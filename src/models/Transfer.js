// // backend/src/models/Transfer.js
// import mongoose from 'mongoose';
// import { Schema } from 'mongoose';

// const transferSchema = new mongoose.Schema({
//     user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     sourceAccount: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
//     recipient: { type: Schema.Types.ObjectId, ref: 'Recipient', required: true },
//     sendAmount: { type: Number, required: true },
//     receiveAmount: { type: Number, required: true },
//     sendCurrency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
//     receiveCurrency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
//     exchangeRate: { type: Number, required: true },
//     // --- MODIFIED ---
//     fees: { type: Number, default: 0 }, // Default to 0, no longer required by service
//     // --- END MODIFIED ---
//     reason: { type: String },
//     reference: { type: String },
//     status: {
//         type: String,
//         enum: ['pending', 'processing', 'completed', 'failed', 'canceled'],
//         default: 'pending'
//     },
//     // --- REMOVED ---
//     // estimatedArrival: { type: String }, // Removed - Tied to schedule/fees usually
//     // --- END REMOVED ---
//     transactionId: { type: String, unique: true, sparse: true },
//     failureReason: { type: String },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
// });

// transferSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });

// const Transfer = mongoose.model('Transfer', transferSchema);

// export default Transfer;


// backend/src/models/Transfer.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const transferSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceAccount: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'Recipient', required: true },
    sendAmount: { type: Number, required: true }, // Final amount sent from source account
    receiveAmount: { type: Number, required: true }, // Final amount received by recipient
    sendCurrency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true }, // Link to currency doc
    receiveCurrency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true }, // Link to currency doc
    exchangeRate: { type: Number, required: true }, // Our Rate (Rounded 2) used for conversion

    // --- ADDED FEE BREAKDOWN FIELDS ---
    liveExchangeRate: { type: Number }, // Market Rate (Rounded 4) - for comparison record
    rateAdjustmentApplied: { type: Number, default: 0 }, // Percentage adjustment applied by us
    wiseFeePercentage: { type: Number, default: 0 }, // Percentage fee configured for source currency
    bankTransferFee: { type: Number, default: 0 }, // Flat fee amount configured for source currency (in send currency)
    wiseFeeAmount: { type: Number, default: 0 }, // Calculated wise fee amount (in send currency)
    totalFee: { type: Number, default: 0 }, // Total calculated fee amount (in send currency)
    // --- END ADDED FEE BREAKDOWN FIELDS ---

    reason: { type: String },
    reference: { type: String },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'canceled'],
        default: 'pending'
    },
    transactionId: { type: String, unique: true, sparse: true }, // External transaction ID if any
    failureReason: { type: String }, // Reason for failure or cancellation
    // createdAt and updatedAt are added automatically by { timestamps: true }
}, { timestamps: true }); // Add Mongoose timestamps for createdAt and updatedAt

// Remove the manual pre('save') hook if using { timestamps: true }
/*
transferSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
*/

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;