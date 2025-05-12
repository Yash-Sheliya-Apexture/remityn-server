// backend/src/config/auth.config.js
export default {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-jwt-key',
    jwtExpiration: '24h', // Increased to 24 hours for development
};