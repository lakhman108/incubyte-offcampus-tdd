const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetshop_test';
    await mongoose.connect(uri);
    console.log('[DB] mongodb connected');
  } catch (error) {
    console.log('[DB] connection error', error);
    process.exit(1);
  }
};

const clearDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('[DB] mongodb cleared');
  } catch (error) {
    console.log('[DB] clear error', error);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[DB] mongodb closed');
  } catch (error) {
    console.log('[DB] close error', error);
    process.exit(1);
  }
};

module.exports = { connectDB, clearDB, closeDB };
