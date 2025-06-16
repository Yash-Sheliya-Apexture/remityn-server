import accountService from '../services/account.service.js';

const getUserAccounts = async (req, res, next) => {
    try {
        const userId = req.user._id; // User ID is available from authMiddleware
        const accounts = await accountService.getUserAccounts(userId);
        res.json(accounts);
    } catch (error) {
        next(error);
    }
};

const addCurrencyAccount = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { currencyCode } = req.body; // Expecting currencyCode in the request body

        if (!currencyCode) {
            return res.status(400).json({ message: 'Currency code is required' });
        }

        const newAccount = await accountService.addCurrencyAccount(userId, currencyCode);
        res.status(201).json(newAccount); // Respond with the newly created account
    } catch (error) {
        next(error);
    }
};


const getAccountById = async (req, res, next) => {
    try {
        const balanceId = req.params.balanceId;
        const account = await accountService.getAccountById(balanceId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account);
    } catch (error) {
        next(error);
    }
};


export default {
    getUserAccounts,
    addCurrencyAccount,
    getAccountById,
};