// backend/src/controllers/recipient.controller.js
import recipientService from '../services/recipient.service.js';

const addRecipient = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const recipientData = { ...req.body, user: userId }; // Add user ID to recipient data
        const newRecipient = await recipientService.addRecipient(recipientData);
        res.status(201).json(newRecipient);
    } catch (error) {
        next(error);
    }
};

const getUserRecipients = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const recipients = await recipientService.getUserRecipients(userId);
        res.json(recipients);
    } catch (error) {
        next(error);
    }
};

const getRecipientById = async (req, res, next) => {
    try {
        const recipientId = req.params.recipientId;
        const recipient = await recipientService.getRecipientById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        res.json(recipient);
    } catch (error) {
        next(error);
    }
};

const updateRecipient = async (req, res, next) => {
    try {
        const recipientId = req.params.recipientId;
        const updateData = req.body;
        const updatedRecipient = await recipientService.updateRecipient(recipientId, updateData);
        if (!updatedRecipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        res.json(updatedRecipient);
    } catch (error) {
        next(error);
    }
};

const deleteRecipient = async (req, res, next) => {
    try {
        const recipientId = req.params.recipientId;
        const deletedRecipient = await recipientService.deleteRecipient(recipientId);
        if (!deletedRecipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        res.json({ message: 'Recipient deleted successfully' });
    } catch (error) {
        next(error);
    }
};


export default {
    addRecipient,
    getUserRecipients,
    getRecipientById,
    updateRecipient,
    deleteRecipient,
};