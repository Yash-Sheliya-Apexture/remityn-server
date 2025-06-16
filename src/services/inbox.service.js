// backend/src/services/inbox.service.js
import InboxMessage from '../models/InboxMessage.js';
import User from '../models/User.js'; // To check if user exists
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

/**
 * Get messages for a specific user with pagination.
 */
const getMessagesForUser = async (userId, { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format.', 400);
    }

    const skip = (page - 1) * limit;
    const sortParams = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    try {
        const messages = await InboxMessage.find({ userId })
            .sort(sortParams)
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for performance

        const totalMessages = await InboxMessage.countDocuments({ userId });

        return {
            messages,
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
        };
    } catch (error) {
        console.error(`Error fetching messages for user ${userId}:`, error);
        throw new AppError('Failed to retrieve inbox messages.', 500);
    }
};

/**
 * Get the count of unread messages for a user.
 */
const countUnreadMessagesForUser = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format.', 400);
    }
    try {
        return await InboxMessage.countDocuments({ userId, isRead: false });
    } catch (error) {
        console.error(`Error counting unread messages for user ${userId}:`, error);
        throw new AppError('Failed to count unread messages.', 500);
    }
};

/**
 * Mark a specific message as read for a user.
 */
const markMessageAsRead = async (userId, messageId) => {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(messageId)) {
        throw new AppError('Invalid user or message ID format.', 400);
    }

    try {
        // Find the message ensuring it belongs to the user
        const message = await InboxMessage.findOne({ _id: messageId, userId });

        if (!message) {
            throw new AppError('Message not found or does not belong to the user.', 404);
        }

        if (message.isRead) {
            return message; // Already read, no update needed
        }

        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        console.log(`Marked message ${messageId} as read for user ${userId}`);
        return message;
    } catch (error) {
        console.error(`Error marking message ${messageId} as read for user ${userId}:`, error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to mark message as read.', 500);
    }
};

/**
 * Delete a specific message for a user.
 */
const deleteUserMessage = async (userId, messageId) => {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(messageId)) {
        throw new AppError('Invalid user or message ID format.', 400);
    }

    try {
        // Find and delete, ensuring it belongs to the user
        const result = await InboxMessage.deleteOne({ _id: messageId, userId });

        if (result.deletedCount === 0) {
            throw new AppError('Message not found or does not belong to the user.', 404);
        }

        console.log(`Deleted message ${messageId} for user ${userId}`);
        return { success: true, message: 'Message deleted successfully.' };
    } catch (error) {
        console.error(`Error deleting message ${messageId} for user ${userId}:`, error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete message.', 500);
    }
};


export default {
    getMessagesForUser,
    countUnreadMessagesForUser,
    markMessageAsRead,
    deleteUserMessage,
};