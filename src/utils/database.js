import mongoose from 'mongoose';
import config from '../config/index.js';

const connectDB = async () => {
    try {
        await mongoose.connect(config.database.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;