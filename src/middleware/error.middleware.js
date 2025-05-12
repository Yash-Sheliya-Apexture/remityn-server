const errorHandler = (err, req, res, next) => {
    // Log the error for debugging and monitoring - use a proper logging system in production
    console.error('ERROR:', err);

    // Determine the status code - use the error status if available, otherwise default to 500 (Internal Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // If response status is still 200, default to 500, otherwise use existing status
    res.status(statusCode);

    // Respond with a JSON error object
    res.json({
        message: err.message, // Send error message to client - consider if you want to expose detailed error messages in production
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Send stack trace only in development mode for debugging, not in production for security reasons
    });
};

export default errorHandler;