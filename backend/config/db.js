// const mongoose = require('mongoose');
// const createIndexes = require('./dbSetup'); // Import the index creation function

// const connectDB = async () => {
//     try {
//         // MongoDB Connection
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true, // Ensures compatibility with the MongoDB URI format
//             useUnifiedTopology: true, // Enables the modern connection management engine
//         });

//         console.log('✅ Connected to MongoDB');

//         // Create indexes
//         await createIndexes();
//         console.log('✅ Indexes created successfully');
//     } catch (error) {
//         console.error('❌ MongoDB connection or index creation failed:', error.message);
//         process.exit(1); // Exit the process if there's a connection error
//     }
// };

// // Export the connection function for use in the main application
// module.exports = connectDB;


const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not set. Please set it in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // fail fast in dev instead of hanging
    });
    console.log(`✅ Connected to MongoDB (${mongoose.connection.name})`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err?.message || err);
    process.exit(1);
  }
}

module.exports = connectDB;
