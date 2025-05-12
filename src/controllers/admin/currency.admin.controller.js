// // backend/src/controllers/admin/currency.admin.controller.js
// import currencyAdminService from '../../services/admin/currency.admin.service.js';

// const getAllCurrenciesAdmin = async (req, res, next) => {
//     try {
//         const currencies = await currencyAdminService.getAllCurrenciesAdmin();
//         res.json(currencies);
//     } catch (error) {
//         next(error);
//     }
// };

// const getCurrencyByIdAdmin = async (req, res, next) => {
//     try {
//         const { currencyId } = req.params;
//         const currency = await currencyAdminService.getCurrencyByIdAdmin(currencyId);
//         if (!currency) {
//             return res.status(404).json({ message: 'Currency not found' });
//         }
//         res.json(currency);
//     } catch (error) {
//         next(error);
//     }
// };

// const createCurrencyAdmin = async (req, res, next) => {
//     try {
//         const { code, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, currencyName, flagImage } = req.body; // Expect flagImage as text input

//         const newCurrency = await currencyAdminService.createCurrencyAdmin({
//             code: code.toUpperCase(),
//             payeeName,
//             iban,
//             bicSwift,
//             bankAddress,
//             wiseFeePercentage,
//             bankTransferFee,
//             flagImage, // Store the provided flagImage path directly
//             currencyName,
//         });
//         res.status(201).json(newCurrency);
//     } catch (error) {
//         next(error);
//     }
// };

// const updateCurrencyAdmin = async (req, res, next) => {
//     try {
//         const { currencyId } = req.params;
//         const { code, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, currencyName, flagImage } = req.body; // Expect flagImage as text input

//         const updatedCurrency = await currencyAdminService.updateCurrencyAdmin(currencyId, {
//             code: code.toUpperCase(),
//             payeeName,
//             iban,
//             bicSwift,
//             bankAddress,
//             wiseFeePercentage,
//             bankTransferFee,
//             flagImage, // Store the provided flagImage path directly
//             currencyName,
//         });
//         res.json(updatedCurrency);
//     } catch (error) {
//         next(error);
//     }
// };

// const deleteCurrencyAdmin = async (req, res, next) => {
//     try {
//         const { currencyId } = req.params;
//         await currencyAdminService.deleteCurrencyAdmin(currencyId);
//         res.status(204).send();
//     } catch (error) {
//         next(error);
//     }
// };

// export default {
//     getAllCurrenciesAdmin,
//     getCurrencyByIdAdmin,
//     createCurrencyAdmin,
//     updateCurrencyAdmin,
//     deleteCurrencyAdmin,
// };


// backend/src/controllers/admin/currency.admin.controller.js
import currencyAdminService from '../../services/admin/currency.admin.service.js';
import mongoose from 'mongoose'; // Import mongoose

const getAllCurrenciesAdmin = async (req, res, next) => {
    try {
        const currencies = await currencyAdminService.getAllCurrenciesAdmin();
        res.json(currencies);
    } catch (error) {
        next(error);
    }
};

const getCurrencyByIdAdmin = async (req, res, next) => {
    try {
        const { currencyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(currencyId)) {
             return res.status(400).json({ message: 'Invalid currency ID format' });
        }
        const currency = await currencyAdminService.getCurrencyByIdAdmin(currencyId);
        if (!currency) {
            return res.status(404).json({ message: 'Currency not found' });
        }
        res.json(currency);
    } catch (error) {
        next(error);
    }
};

const createCurrencyAdmin = async (req, res, next) => {
    try {
        // Include rateAdjustmentPercentage
        const { code, currencyName, flagImage, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee, rateAdjustmentPercentage } = req.body;

        const newCurrency = await currencyAdminService.createCurrencyAdmin({
            code, currencyName, flagImage, payeeName, iban, bicSwift, bankAddress, wiseFeePercentage, bankTransferFee,
            rateAdjustmentPercentage, // Pass new field
        });
        res.status(201).json(newCurrency);
    } catch (error) {
         if (error.message.includes('already exists')) return res.status(409).json({ message: error.message });
         if (error.message.includes('required') || error.message.includes('must be')) return res.status(400).json({ message: error.message });
        next(error);
    }
};

const updateCurrencyAdmin = async (req, res, next) => {
    try {
        const { currencyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(currencyId)) return res.status(400).json({ message: 'Invalid currency ID format' });

        const updateData = req.body; // Pass the whole body including rateAdjustmentPercentage

        const updatedCurrency = await currencyAdminService.updateCurrencyAdmin(currencyId, updateData);
        res.json(updatedCurrency);
    } catch (error) {
         if (error.message === 'Currency not found.') return res.status(404).json({ message: error.message });
         if (error.message.includes('already exists')) return res.status(409).json({ message: error.message });
         if (error.message.includes('must be')) return res.status(400).json({ message: error.message });
        next(error);
    }
};


const deleteCurrencyAdmin = async (req, res, next) => {
    try {
        const { currencyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(currencyId)) {
             return res.status(400).json({ message: 'Invalid currency ID format' });
        }
        await currencyAdminService.deleteCurrencyAdmin(currencyId);
        res.status(204).send(); // No content on successful deletion
    } catch (error) {
        if (error.message === 'Currency not found.') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

export default {
    getAllCurrenciesAdmin,
    getCurrencyByIdAdmin,
    createCurrencyAdmin,
    updateCurrencyAdmin,
    deleteCurrencyAdmin,
};