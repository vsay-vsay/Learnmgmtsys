import { app } from "./app";
import connectDB from "./utils/db";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Port configuration
const PORT = process.env.PORT || 8000;
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Mode: ${process.env.NODE_ENV}`);
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (err: Error) => {
            console.log(`Error: ${err.message}`);
            console.log("Shutting down the server due to unhandled promise rejection");
            
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error: any) {
        console.log("Error starting server:", error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exception");
    process.exit(1);
});

startServer();