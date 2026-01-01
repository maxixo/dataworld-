import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import datasetRoutes from './routes/datasets';
import draftRoutes from './routes/drafts';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URL || 'https://dataworld-xx.vercel.app/',
    credentials: true,
    optionsSuccessStatus: 200
};

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CSP middleware - MUST come BEFORE routes
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' https:;"
  );
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/drafts', draftRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('DataWorld API is running');
});

// Test middleware route
app.get('/api/test-error', (req, res, next) => {
    const err = new Error('Test Error from Middleware');
    next(err);
});

// Error handler - MUST come LAST
app.use(errorHandler);

export default app;
