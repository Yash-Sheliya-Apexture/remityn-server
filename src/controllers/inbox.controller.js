// backend/src/controllers/inbox.controller.js
import inboxService from '../services/inbox.service.js';

const getMyInboxMessages = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const paginationOptions = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sortBy,
            sortOrder
        };

        const result = await inboxService.getMessagesForUser(userId, paginationOptions);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getMyUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        const count = await inboxService.countUnreadMessagesForUser(userId);
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        next(error);
    }
};

const markMessageRead = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const messageId = req.params.messageId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        const updatedMessage = await inboxService.markMessageAsRead(userId, messageId);
        res.status(200).json(updatedMessage);
    } catch (error) {
        next(error);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const messageId = req.params.messageId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        const result = await inboxService.deleteUserMessage(userId, messageId);
        res.status(200).json(result); // Or status 204 No Content
    } catch (error) {
        next(error);
    }
};

export default {
    getMyInboxMessages,
    getMyUnreadCount,
    markMessageRead,
    deleteMessage,
};