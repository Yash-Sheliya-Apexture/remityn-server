// backend/utils/AppError.js

/**
 * Custom error class for application-specific errors.
 * Includes HTTP status code and an operational flag.
 */
class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code (e.g., 400, 404, 500).
     */
    constructor(message, statusCode) {
        // Call the parent constructor (Error) with the message
        super(message);

        // Set the HTTP status code
        this.statusCode = statusCode;

        // Determine the status string ('fail' for 4xx, 'error' for 5xx)
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Mark the error as operational (as opposed to a programming error)
        // Operational errors are expected issues like invalid input, not found, etc.
        this.isOperational = true;

        // Capture the stack trace, excluding the constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;