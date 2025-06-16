// backend/src/middleware/recipient.validation.middleware.js
import validator from 'validator';

export const validateAddRecipient = (req, res, next) => {
    const { accountHolderName, ifscCode, accountNumber, bankName, address, accountType } = req.body; // Include accountType
    let errors = {};

    if (validator.isEmpty(accountHolderName)) {
        errors.accountHolderName = 'Account holder name is required';
    }
    if (validator.isEmpty(ifscCode)) {
        errors.ifscCode = 'IFSC code is required';
    }
    if (validator.isEmpty(accountNumber)) {
        errors.accountNumber = 'Account number is required';
    }
    if (validator.isEmpty(bankName)) {
        errors.bankName = 'Bank name is required';
    }
    if (validator.isEmpty(address)) {
        errors.address = 'Address is required';
    }
    if (validator.isEmpty(accountType)) { // Validate accountType
        errors.accountType = 'Account type is required';
    } else if (!['Savings', 'Current', 'Salary'].includes(accountType)) { // Validate enum values
        errors.accountType = 'Invalid account type';
    }


    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors: errors });
    }

    next();
};