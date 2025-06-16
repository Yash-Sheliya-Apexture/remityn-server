// export default {
//     mongoUrl: process.env.MONGO_URI || 'mongodb+srv://yashmorenainfotech6:vDl2PO8fAYoVCd6A@cluster0.ibpvm.mongodb.net/wise?retryWrites=true&w=majority&appName=Cluster0', // Replace with your MongoDB URI or connection string - IMPORTANT!
// };

// backend/config/database.config.js

export default {
    // This forces the app to use the MONGO_URI from your environment variables.
    mongoUrl: process.env.MONGO_URI, 
};