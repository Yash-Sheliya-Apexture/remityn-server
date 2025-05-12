// backend/src/services/admin/inbox.admin.service.js
import InboxMessage from '../../models/InboxMessage.js';
import User from '../../models/User.js';
import mongoose from 'mongoose';
import AppError from '../../utils/AppError.js';
import { v4 as uuidv4 } from 'uuid'; // <-- Import uuid

/**
 * Admin creates and sends an inbox message to a specific user.
 * (Keep this function as it is)
 */
const createInboxMessageForUser = async (adminSenderInfo, targetUserId, subject, body) => {
    // ... (keep existing implementation)
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new AppError('Invalid target user ID format.', 400);
    }
    if (!subject || !body) {
        throw new AppError('Subject and body are required.', 400);
    }

    try {
        const targetUser = await User.findById(targetUserId).select('_id');
        if (!targetUser) {
            throw new AppError('Target user not found.', 404);
        }

        const newMessage = new InboxMessage({
            userId: targetUserId,
            sender: `Admin (${adminSenderInfo.name || adminSenderInfo.id})`,
            subject: subject,
            body: body,
            isRead: false,
        });

        await newMessage.save();

        console.log(`Admin ${adminSenderInfo.id} sent message to user ${targetUserId}`);
        return newMessage.toObject();

    } catch (error) {
        console.error(`Error sending admin message to user ${targetUserId}:`, error);
        if (error instanceof AppError) throw error;
        if (error.name === 'ValidationError') {
            throw new AppError(`Validation failed: ${error.message}`, 400);
        }
        throw new AppError('Failed to send inbox message.', 500);
    }
};

/**
 * Admin gets all inbox messages across all users with pagination and sorting.
 */
const getAllMessages = async ({ page = 1, limit = 15, sortBy = 'createdAt', sortOrder = 'desc', userId = null, readStatus = null } = {}) => {
    // ... (keep existing implementation)
    const skip = (page - 1) * limit;
    const sortParams = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const query = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = userId;
    }
    if (readStatus !== null && typeof readStatus === 'boolean') {
        query.isRead = readStatus;
    }

    try {
        const messages = await InboxMessage.find(query)
            .populate('userId', 'fullName email _id') // Populate user details
            .sort(sortParams)
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for performance

        const totalMessages = await InboxMessage.countDocuments(query);

        return {
            messages,
            currentPage: page,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
        };
    } catch (error) {
        console.error('Error fetching all inbox messages for admin:', error);
        throw new AppError('Failed to retrieve inbox messages.', 500);
    }
};

/**
 * Admin updates a specific message (subject/body) by its ID.
 */
const updateMessageById = async (messageId, subject, body) => {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new AppError('Invalid message ID format.', 400);
    }
    if (!subject || !body) {
        throw new AppError('Subject and body are required.', 400);
    }

    try {
        const updatedMessage = await InboxMessage.findByIdAndUpdate(
            messageId,
            { subject, body },
            { new: true, runValidators: true } // Return updated doc, run schema validation
        ).populate('userId', 'fullName email _id').lean(); // Re-populate after update

        if (!updatedMessage) {
            throw new AppError('Message not found or could not be updated.', 404);
        }

        console.log(`Admin updated message ${messageId}`);
        return updatedMessage;

    } catch (error) {
        console.error(`Error updating message ${messageId} by admin:`, error);
        if (error instanceof AppError) throw error;
        if (error.name === 'ValidationError') {
           throw new AppError(`Validation failed: ${error.message}`, 400);
        }
        throw new AppError('Failed to update message.', 500);
    }
};

/**
 * Admin deletes any specific message by its ID.
 */
const deleteMessageById = async (messageId) => {
    // ... (keep existing implementation)
     if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new AppError('Invalid message ID format.', 400);
    }

    try {
        const result = await InboxMessage.findByIdAndDelete(messageId);

        if (!result) {
            throw new AppError('Message not found.', 404);
        }

        console.log(`Admin deleted message ${messageId}`);
        return { success: true, message: 'Message deleted successfully by admin.' };
    } catch (error) {
        console.error(`Error deleting message ${messageId} by admin:`, error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete message.', 500);
    }
};


/**
 * Admin creates and sends an inbox message to ALL active users with a Batch ID.
 */
const createMessageForAllUsers = async (adminSenderInfo, subject, body) => {
    // ... (validation remains the same) ...
    if (!subject || !body) {
        throw new AppError('Subject and body are required.', 400);
    }
    if (!adminSenderInfo || !adminSenderInfo.id) {
        throw new AppError('Admin sender information is missing.', 500);
    }

    const batchId = uuidv4(); // <-- Generate a unique Batch ID
    const sentAtTime = new Date(); // <-- Use consistent time for all messages in batch

    try {
        const users = await User.find({}, '_id').lean();
        if (!users || users.length === 0) {
             return { success: true, count: 0, message: "No users found to send messages to." };
        }

        const userIds = users.map(user => user._id);
        const adminSenderString = `Admin (${adminSenderInfo.name || adminSenderInfo.id})`;

        const messagesToInsert = userIds.map(userId => ({
            userId: userId,
            sender: adminSenderString,
            subject: subject,
            body: body,
            isRead: false,
            batchId: batchId, // <-- Assign Batch ID
            sentAt: sentAtTime, // <-- Assign consistent sent time
            // Timestamps (createdAt, updatedAt) are automatic
        }));

        const result = await InboxMessage.insertMany(messagesToInsert, { ordered: false });
        const sentCount = result.length;
        console.log(`Admin ${adminSenderInfo.id} sent message batch ${batchId} to ${userIds.length} users. Inserted: ${sentCount}.`);

        return {
            success: true,
            count: sentCount,
            totalAttempted: userIds.length,
            batchId: batchId, // Optionally return batchId
            message: `Message batch ${batchId.substring(0,8)}... sent to ${sentCount} users.`
        };

    } catch (error) {
        // ... (error handling remains similar) ...
        console.error(`Error sending admin message batch ${batchId}:`, error);
        throw new AppError('Failed to send message batch to all users.', 500);
    }
};

/**
 * Get a list of unique broadcast batches (one entry per batchId) with pagination.
 */
const getBroadcastBatches = async ({ page = 1, limit = 10, sortBy = 'sentAt', sortOrder = 'desc' } = {}) => {
    const skip = (page - 1) * limit;
    const sortParams = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    try {
        // Aggregation pipeline to get unique batches
        const pipeline = [
            { $match: { batchId: { $exists: true, $ne: null } } }, // Only messages with a batchId
            { $sort: { sentAt: -1 } }, // Sort by sent time BEFORE grouping to get latest info
            {
                $group: {
                    _id: '$batchId', // Group by batchId
                    subject: { $first: '$subject' }, // Get subject from the first doc in the group
                    bodySnippet: { $first: { $substrCP: ['$body', 0, 100] } }, // Get body snippet
                    sender: { $first: '$sender' }, // Get sender
                    sentAt: { $first: '$sentAt' }, // Get the send time of the batch
                    recipientCount: { $sum: 1 } // Count how many messages (recipients) are in this batch
                }
            },
            {
                $project: { // Reshape the output
                     _id: 0, // Remove the default _id
                     batchId: '$_id', // Rename _id to batchId
                     subject: 1,
                     bodySnippet: 1,
                     sender: 1,
                     sentAt: 1,
                     recipientCount: 1
                }
            },
            { $sort: sortParams }, // Sort the final grouped results
            { $skip: skip },
            { $limit: limit }
        ];

        // Execute the aggregation pipeline for the data
        const batches = await InboxMessage.aggregate(pipeline);

        // Need a separate pipeline to count total unique batches for pagination
        const countPipeline = [
            { $match: { batchId: { $exists: true, $ne: null } } },
            { $group: { _id: '$batchId' } }, // Group just to get unique batchIds
            { $count: 'totalBatches' } // Count the unique groups
        ];

        const countResult = await InboxMessage.aggregate(countPipeline);
        const totalBatches = countResult.length > 0 ? countResult[0].totalBatches : 0;

        return {
            batches, // The list of unique batches for the current page
            currentPage: page,
            totalPages: Math.ceil(totalBatches / limit),
            totalBatches, // Total number of unique batches
        };

    } catch (error) {
        console.error('Error fetching broadcast batches:', error);
        throw new AppError('Failed to retrieve broadcast message batches.', 500);
    }
};

/**
 * Admin deletes all messages associated with a specific batchId.
 */
const deleteMessagesByBatchId = async (batchId) => {
    if (!batchId) {
        throw new AppError('Batch ID is required for deletion.', 400);
    }

    try {
        console.log(`Admin attempting to delete message batch ${batchId}...`);
        const result = await InboxMessage.deleteMany({ batchId: batchId });

        if (result.deletedCount === 0) {
            console.warn(`Admin attempted to delete batch ${batchId}, but no messages were found.`);
            // Could throw 404, but maybe returning success is okay if the goal is "ensure it's gone"
            // throw new AppError('Message batch not found or already deleted.', 404);
        }

        console.log(`Admin successfully deleted ${result.deletedCount} messages for batch ${batchId}.`);
        return {
            success: true,
            deletedCount: result.deletedCount,
            message: `Successfully deleted ${result.deletedCount} messages for batch ${batchId.substring(0,8)}...`
        };
    } catch (error) {
        console.error(`Error deleting message batch ${batchId} by admin:`, error);
        throw new AppError('Failed to delete message batch.', 500);
    }
};


/**
 * Admin updates the subject and body of all messages associated with a specific batchId.
 * WARNING: This modifies messages already delivered to users.
 */
const updateBatchMessages = async (batchId, newSubject, newBody) => {
    if (!batchId) {
        throw new AppError('Batch ID is required for update.', 400);
    }
    if (!newSubject || !newSubject.trim() || !newBody || !newBody.trim()) {
        throw new AppError('New subject and body cannot be empty.', 400);
    }

    try {
        console.log(`Admin attempting to update messages for batch ${batchId}...`);
        const updateData = {
            subject: newSubject.trim(),
            body: newBody.trim(),
            updatedAt: new Date() // Manually update 'updatedAt' as we're not using .save()
        };

        // Find one message to confirm the batch exists before a potentially large updateMany
        const existingMessage = await InboxMessage.findOne({ batchId });
        if (!existingMessage) {
            throw new AppError('Message batch not found.', 404);
        }

        const result = await InboxMessage.updateMany({ batchId: batchId }, { $set: updateData });

        console.log(`Admin successfully updated ${result.modifiedCount} messages for batch ${batchId}. Matched: ${result.matchedCount}.`);
        return {
            success: true,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount,
            message: `Successfully updated ${result.modifiedCount} messages for batch ${batchId.substring(0,8)}...`
        };
    } catch (error) {
        console.error(`Error updating messages for batch ${batchId} by admin:`, error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update messages in batch.', 500);
    }
};

export default {
    createInboxMessageForUser,
    getAllMessages,
    updateMessageById,     // <-- ADD NEW
    deleteMessageById,
    createMessageForAllUsers, // Modified
    getBroadcastBatches,      // New
    deleteMessagesByBatchId,  // New
     // New
     updateBatchMessages, // <-- ADD NEW EXPORT
};