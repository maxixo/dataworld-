import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { promises as dnsPromises } from 'dns';

import authRoutes from './routes/auth';
import datasetRoutes from './routes/datasets';
import { errorHandler } from './middleware/error';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    console.error('Please add JWT_SECRET to your .env file');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with specific allowed origins
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);

app.get('/', (req, res) => {
    res.send('DataWorld API is running');
});

// Test middleware route
app.get('/api/test-error', (req, res, next) => {
    const err = new Error('Test Error from Middleware');
    next(err);
});

app.use(errorHandler);

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dataworld';
    console.log(`Attempting to connect to MongoDB...`);

    // Ensure predictable DNS resolution for SRV lookups (Atlas uses SRV)
    try {
        const dnsServers = [process.env.DNS_SERVER1 || '1.1.1.1', process.env.DNS_SERVER2 || '8.8.8.8'];
        dns.setServers(dnsServers);
        console.log('Using DNS servers:', dns.getServers());
    } catch (e) {
        console.warn('Could not set DNS servers:', e);
    }

    // If using mongodb+srv, optionally validate SRV resolution first to give clearer errors
    if (mongoUri.startsWith('mongodb+srv://')) {
        try {
            const host = mongoUri.replace('mongodb+srv://', '').split('/')[0];
            const srvName = `_mongodb._tcp.${host}`;
            const srv = await dnsPromises.resolveSrv(srvName);
            console.log(`SRV records for ${srvName}:`, srv.map(s => `${s.name}:${s.port}`));
        } catch (err) {
            console.error(`SRV lookup failed for MongoDB host. Error:`, err);
            console.log('Hint: DNS SRV resolution failed (ESERVFAIL). .');
        }
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
        });
        console.log('MongoDB Connected successfully!');
    } catch (err) {
        console.error('CRITICAL: MongoDB connection error:', err);
        console.log('Please check your network connection and Atlas IP allowlist.');
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
