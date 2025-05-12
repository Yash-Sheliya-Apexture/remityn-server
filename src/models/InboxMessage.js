// // backend/src/models/InboxMessage.js
// import mongoose from 'mongoose';

// const inboxMessageSchema = new mongoose.Schema({
//     userId: { // The recipient user
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//         index: true,
//     },
//     sender: { // Could be 'System', 'Admin', or potentially an admin user ID later
//         type: String,
//         default: 'System', // Simple default for now
//     },
//     subject: {
//         type: String,
//         required: [true, 'Message subject is required.'],
//         trim: true,
//         maxlength: [200, 'Subject cannot exceed 200 characters.'],
//     },
//     body: {
//         type: String,
//         required: [true, 'Message body is required.'],
//         trim: true,
//         maxlength: [5000, 'Body cannot exceed 5000 characters.'],
//     },
//     isRead: {
//         type: Boolean,
//         default: false,
//         index: true, // Index for faster querying of unread messages
//     },
//     sentAt: {
//         type: Date,
//         default: Date.now,
//     },
//     readAt: { // Optional: track when it was read
//         type: Date,
//     },
// }, {
//     timestamps: true, // Adds createdAt and updatedAt
// });

// // Optional: Ensure user can only interact with their own messages (enforced in service layer too)
// inboxMessageSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user's inbox sorted by date

// const InboxMessage = mongoose.model('InboxMessage', inboxMessageSchema);

// export default InboxMessage;

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

const inboxMessageSchema = new mongoose.Schema({
    userId: { // The recipient user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    sender: { // Could be 'System', 'Admin', or potentially an admin user ID later
        type: String,
        default: 'System',
    },
    subject: {
        type: String,
        required: [true, 'Message subject is required.'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters.'],
    },
    body: {
        type: String,
        required: [true, 'Message body is required.'],
        trim: true,
        maxlength: [5000, 'Body cannot exceed 5000 characters.'],
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true, // Index for faster querying of unread messages
    },
    sentAt: { // Keep this for sorting consistency
        type: Date,
        default: Date.now,
    },
    readAt: { // Optional: track when it was read
        type: Date,
    },
    batchId: { // <-- NEW FIELD
        type: String,
        index: true, // Index for efficient lookup/deletion
        sparse: true, // Index only if the field exists
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

// Optional: Ensure user can only interact with their own messages (enforced in service layer too)
inboxMessageSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user's inbox sorted by date
inboxMessageSchema.index({ batchId: 1, createdAt: -1 }); // Index for batch operations

const InboxMessage = mongoose.model('InboxMessage', inboxMessageSchema);

export default InboxMessage;