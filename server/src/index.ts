import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { promises as dnsPromises } from 'dns';
import app from './app';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    console.error('Please add JWT_SECRET to your .env file');
    process.exit(1);
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

/**
 * Connects to MongoDB database with DNS configuration and SRV record resolution
 * Handles connection errors and provides detailed logging
 */
const connectDB = async (retries = 5, delay = 5000) => {
    // Get MongoDB URI from environment variables or use default
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dataworld';

    // Remove the manual SRV lookup - let MongoDB driver handle DNS resolution
    // The driver has built-in DNS resolution that's more robust
    
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to connect to MongoDB... (Attempt ${i + 1}/${retries})`);
            
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                // Add these options for better connection handling
                retryWrites: true,
                w: 'majority',
            });

            console.log('✅ Successfully connected to MongoDB');
            return;
        } catch (err: any) {
            console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
            
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error('CRITICAL: Failed to connect to MongoDB after multiple attempts');
    console.error('Server will continue running but database features will not work');
    console.error('Please check:');
    console.error('1. Your internet connection');
    console.error('2. MongoDB Atlas cluster status (https://cloud.mongodb.com)');
    console.error('3. Network access whitelist in MongoDB Atlas');
    console.error('4. DNS settings if you are behind a corporate firewall');
};

connectDB();


// Listen on 0.0.0.0 to accept connections from any network interface
app.listen(PORT, '0.0.0.0', () => {
});
