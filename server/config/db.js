const mongoose = require('mongoose');

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('MongoDB MONGO_URI not configured — running with fallback');
    return;
  }
  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB connection failed — some features may not work:', err.message);
  }
};