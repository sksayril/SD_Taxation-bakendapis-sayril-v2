// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://kabitadas67069_db_user:kabita%4022@cluster0.vongyjy.mongodb.net/sdtaxation';

    // ✅ Updated connection (no deprecated options)
    await mongoose.connect(uri);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
