
// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Anchal19_:jainanchal165@cluster0.qfgmiqh.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true
      // Removed deprecated options: useCreateIndex, useFindAndModify
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;