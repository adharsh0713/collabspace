const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "collabspace"
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('DB connection failed:', error.message);
        process.exit(1); // stop app if DB fails
    }
};

module.exports = connectDB;