import mongoose from 'mongoose';
require("dotenv").config(); 

const dbUrl: string = "mongodb+srv://sushant:sushant123@cluster0.wdcpg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Updated connection string

const connectDB = async () => {
  try {
    if (!dbUrl) {
      throw new Error("Database URL is missing. Check your .env file.");
    }

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
