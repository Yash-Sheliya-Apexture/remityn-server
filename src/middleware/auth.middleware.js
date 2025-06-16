import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    // Check if token is in the 'Authorization' header and starts with 'Bearer '
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header - format is "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token using JWT secret from config
            const decoded = jwt.verify(token, config.auth.jwtSecret);

            // Fetch user from database using user ID from decoded token payload
            // Select all fields except password for security
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                return res.status(404).json({ message: 'User not found.' }); // User associated with token not found in DB - token might be valid but user deleted
            }

            next(); // Token is valid and user exists - proceed to the next middleware or route handler
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' }); // 401 Unauthorized - token is invalid (expired, tampered, etc.)
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' }); // 401 Unauthorized - no token provided in header
    }
};

const admin = (req, res, next) => {
    // Check if user object exists in the request (set by 'protect' middleware) and if user role is 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // User is authenticated and has admin role - proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' }); // 403 Forbidden - user is not admin or not authenticated properly
    }
};

export default { protect, admin };