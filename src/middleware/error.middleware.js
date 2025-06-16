// const errorHandler = (err, req, res, next) => {
//     // Log the error for debugging and monitoring - use a proper logging system in production
//     console.error('ERROR:', err);

//     // Determine the status code - use the error status if available, otherwise default to 500 (Internal Server Error)
//     const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // If response status is still 200, default to 500, otherwise use existing status
//     res.status(statusCode);

//     // Respond with a JSON error object
//     res.json({
//         message: err.message, // Send error message to client - consider if you want to expose detailed error messages in production
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Send stack trace only in development mode for debugging, not in production for security reasons
//     });
// };

// export default errorHandler;


// backend/src/middleware/error.middleware.js
import AppError from '../utils/AppError.js'; // Ensure you have this or similar

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging purposes, especially in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error object in errorHandler:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  } else {
    console.error('ERROR 💥:', err.message); // Log at least the message in production
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went very wrong!';
  let status = err.status || 'error';

  // If it's an AppError, we trust its properties
  if (err instanceof AppError || err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    status = err.status;
  } else {
    // For non-operational errors in production, hide details
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal server error. Please try again later.';
      status = 'error';
      statusCode = 500; // Ensure it's 500 for truly unexpected errors in prod
    }
  }

  res.status(statusCode).json({
    status: status,
    message: message,
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }), // Show stack for non-op errors in dev
    ...(process.env.NODE_ENV === 'development' && { originalError: err }), // For more debug info in dev
  });
};

export default errorHandler;