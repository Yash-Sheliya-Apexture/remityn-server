// // backend/src/validators/auth.validators.js
// import validator from 'validator'; // Import validator library for input validation

// const validateRegister = (req, res, next) => {
//     const { fullName, email, password } = req.body;

//     // Check for missing fields
//     if (!fullName) {
//         return res.status(400).json({ message: 'Full Name is required.' });
//     }
//     if (!email) {
//         return res.status(400).json({ message: 'Email is required.' });
//     }
//     if (!password) {
//         return res.status(400).json({ message: 'Password is required.' });
//     }

//     // Input validation using 'validator' library
//     if (!validator.isLength(fullName, { min: 2, max: 50 })) { // Example: Full name length validation
//         return res.status(400).json({ message: 'Full Name must be between 2 and 50 characters.' });
//     }

//     if (!validator.isEmail(email)) { // Validate email format
//         return res.status(400).json({ message: 'Invalid email format.' });
//     }

//     if (!validator.isLength(password, { min: 8 })) { // Example: Password length validation
//         return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
//     }
//     // Add more robust password strength validation if needed (e.g., using regex for special characters, numbers, uppercase, lowercase)

//     next(); // If validation passes, proceed to the next middleware or route handler
// };

// const validateLogin = (req, res, next) => {
//     const { email, password } = req.body;

//     // Check for missing fields
//     if (!email) {
//         return res.status(400).json({ message: 'Email is required.' });
//     }
//     if (!password) {
//         return res.status(400).json({ message: 'Password is required.' });
//     }

//     // Validate email format for login
//     if (!validator.isEmail(email)) {
//         return res.status(400).json({ message: 'Invalid email format.' });
//     }

//     next(); // If validation passes, proceed
// };




// const validateForgotPassword = (req, res, next) => {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).json({ message: 'Email is required.' });
//     }
//     if (!validator.isEmail(email)) {
//         return res.status(400).json({ message: 'Invalid email format.' });
//     }
//     next();
// };

// const validateResetPassword = (req, res, next) => {
//     const { token, password } = req.body;
//     if (!token) {
//         return res.status(400).json({ message: 'Token is required.' });
//     }
//     if (!password) {
//         return res.status(400).json({ message: 'Password is required.' });
//     }
//     if (!validator.isLength(password, { min: 8 })) {
//         return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
//     }
//     // Add more password strength validation if needed
//     next();
// };


// export default {
//     validateRegister,
//     validateLogin,
//     validateForgotPassword, // Add validateForgotPassword
//     validateResetPassword,   // Add validateResetPassword
// };

// backend/src/validators/auth.validators.js
import validator from 'validator'; // Import validator library for input validation

const validateRegister = (req, res, next) => {
    const { fullName, email, password } = req.body;

    let errors = {};

    if (!fullName) {
        errors.fullName = 'Full Name is required.';
    } else if (!validator.isLength(fullName, { min: 2, max: 50 })) {
        errors.fullName = 'Full Name must be between 2 and 50 characters.';
    }

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!validator.isEmail(email)) {
        errors.email = 'Invalid email format.';
    }

    if (!password) {
        errors.password = 'Password is required.';
    } else if (!validator.isLength(password, { min: 8 })) {
        errors.password = 'Password must be at least 8 characters long.';
    }
    // Add more robust password strength validation if needed

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors }); // Return all errors
    }

    next(); // If validation passes, proceed to the next middleware or route handler
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    let errors = {};

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!validator.isEmail(email)) {
        errors.email = 'Invalid email format.';
    }

    if (!password) {
        errors.password = 'Password is required.';
    }


    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    next(); // If validation passes, proceed
};


const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;
    let errors = {};
    if (!email) {
        errors.email = 'Email is required.';
    } else if (!validator.isEmail(email)) {
        errors.email = 'Invalid email format.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};

const validateResetPassword = (req, res, next) => {
    const { token, password } = req.body;
    let errors = {};
    if (!token) {
        errors.token = 'Token is required.';
    }
    if (!password) {
        errors.password = 'Password is required.';
    } else if (!validator.isLength(password, { min: 8 })) {
        errors.password = 'Password must be at least 8 characters long.';
    }
    // Add more password strength validation if needed

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};


export default {
    validateRegister,
    validateLogin,
    validateForgotPassword, // Add validateForgotPassword
    validateResetPassword,   // Add validateResetPassword
};