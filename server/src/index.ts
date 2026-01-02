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
const connectDB = async () => {
    // Get MongoDB URI from environment variables or use default
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dataworld';
    try {
        // Configure DNS servers for resolution
        const dnsServers = [process.env.DNS_SERVER1 || '1.1.1.1', process.env.DNS_SERVER2 || '8.8.8.8'];
        dns.setServers(dnsServers);
    } catch (e) {
        console.warn('Could not set DNS servers:', e);
    }

    // For SRV connections (Atlas clusters), perform SRV record lookup
    if (mongoUri.startsWith('mongodb+srv://')) {
        try {
            // Extract host from URI and construct SRV record name
            const host = mongoUri.replace('mongodb+srv://', '').split('/')[0];
            const srvName = `_mongodb._tcp.${host}`;
            // Resolve SRV records
            const srv = await dnsPromises.resolveSrv(srvName);
        } catch (err) {
            console.error(`SRV lookup failed for MongoDB host. Error:`, err);
        }
    }

    // Attempt MongoDB connection with timeout
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
    } catch (err) {
        console.error('CRITICAL: MongoDB connection error:', err);
    }
};

connectDB();


// Listen on 0.0.0.0 to accept connections from any network interface
app.listen(PORT, '0.0.0.0', () => {
});
