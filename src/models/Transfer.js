// backend/src/models/Transfer.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const transferSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceAccount: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'Recipient', required: true },
    sendAmount: { type: Number, required: true },
    receiveAmount: { type: Number, required: true },
    sendCurrency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    receiveCurrency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    exchangeRate: { type: Number, required: true },
    // --- MODIFIED ---
    fees: { type: Number, default: 0 }, // Default to 0, no longer required by service
    // --- END MODIFIED ---
    reason: { type: String },
    reference: { type: String },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'canceled'],
        default: 'pending'
    },
    // --- REMOVED ---
    // estimatedArrival: { type: String }, // Removed - Tied to schedule/fees usually
    // --- END REMOVED ---
    transactionId: { type: String, unique: true, sparse: true },
    failureReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

transferSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;