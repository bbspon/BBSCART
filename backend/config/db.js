const mongoose = require('mongoose');
const createIndexes = require('./dbSetup'); // Import the index creation function

const connectDB = async () => {
    try {
        // MongoDB Connection
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Ensures compatibility with the MongoDB URI format
            useUnifiedTopology: true, // Enables the modern connection management engine
        });

        console.log('✅ Connected to MongoDB');

        // Create indexes
        await createIndexes();
        console.log('✅ Indexes created successfully');
    } catch (error) {
        console.error('❌ MongoDB connection or index creation failed:', error.message);
        process.exit(1); // Exit the process if there's a connection error
    }
};

// Export the connection function for use in the main application
module.exports = connectDB;