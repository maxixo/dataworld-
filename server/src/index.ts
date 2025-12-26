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
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dataworld');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
