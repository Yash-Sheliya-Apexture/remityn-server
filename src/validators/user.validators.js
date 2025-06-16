// backend/src/validators/user.validators.js
import validator from 'validator';

const validateChangePassword = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    let errors = {};

    if (!currentPassword) {
        errors.currentPassword = 'Current password is required.';
    }

    if (!newPassword) {
        errors.newPassword = 'New password is required.';
    } else if (!validator.isLength(newPassword, { min: 8 })) {
        errors.newPassword = 'New password must be at least 8 characters long.';
    }
    // Add more complexity checks if desired (e.g., requires number, symbol, uppercase)
    // else if (!validator.isStrongPassword(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
    //     errors.newPassword = 'Password must be at least 8 characters long and include letters and numbers.'; // Adjust message as needed
    // }

    if (Object.keys(errors).length > 0) {
        console.log("Change Password Validation Failed:", errors);
        return res.status(400).json({ message: "Validation failed", errors });
    }

    next(); // Proceed if validation passes
};

export default {
    validateChangePassword,
};