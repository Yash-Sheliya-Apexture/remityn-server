// backend/src/models/Recipient.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const recipientSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    email: { type: String },
    bankName: { type: String, required: true }, // Bank name is required
    address: { type: String, required: true }, // Address is required
    nickname: { type: String },
    accountType: { // New accountType field
        type: String,
        required: true,
        enum: ['Savings', 'Current'], // Allowed values
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Recipient = mongoose.model('Recipient', recipientSchema);

export default Recipient;