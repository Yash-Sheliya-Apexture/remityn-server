// backend/src/models/Account.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const accountSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User model
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true }, // Link to Currency model
    balance: { type: Number, default: 0 }, // Initial balance is 0
    createdAt: { type: Date, default: Date.now },
});

const Account = mongoose.model('Account', accountSchema);

export default Account;