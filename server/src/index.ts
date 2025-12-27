import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import datasetRoutes from './routes/datasets';
import blogRoutes from './routes/blog';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/blog', blogRoutes);

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
