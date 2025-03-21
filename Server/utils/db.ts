import mongoose from 'mongoose';
require("dotenv").config(); 

const dbUrl: string = process.env.DB_URL!; // Use DB_URL from .env file, assert it is defined

const connectDB = async () => {
  try {
    // The dbUrl is guaranteed to be defined due to the assertion above

    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000, // Wait 10s before timeout
    });

    console.log(`✅ Database connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Error connecting to DB: ${error.message}`);
    setTimeout(connectDB, 5000); // Retry after 5s
  }
};

export default connectDB;
