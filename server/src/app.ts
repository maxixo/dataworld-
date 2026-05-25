import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import datasetRoutes from './routes/datasets';
import draftRoutes from './routes/drafts';
import { errorHandler } from './middleware/error';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();

const parseTrustProxy = () => {
  const rawTrustProxy = process.env.TRUST_PROXY;

  if (rawTrustProxy === undefined) {
    return isProduction ? 1 : false;
  }

  if (rawTrustProxy === 'true') {
    return true;
  }

  if (rawTrustProxy === 'false') {
    return false;
  }

  const parsedTrustProxy = Number(rawTrustProxy);
  return Number.isInteger(parsedTrustProxy) ? parsedTrustProxy : rawTrustProxy;
};

const parseOriginPatterns = () =>
  (process.env.CORS_ALLOWED_ORIGIN_PATTERNS || '')
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean);

const matchesOriginPattern = (origin: string, pattern: string) => {
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escapedPattern}$`).test(origin);
};

const parseAllowedOrigins = () => {
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.FRONTEND_URL) {
    configuredOrigins.push(process.env.FRONTEND_URL.trim());
  }

  const origins = new Set(configuredOrigins);

  [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ].forEach((origin) => {
    if (!isProduction) {
      origins.add(origin);
    }
  });

  if (isProduction && origins.size === 0) {
    console.warn('No production CORS origins configured. Set FRONTEND_URL or CORS_ALLOWED_ORIGINS.');
  }

  return Array.from(origins);
};

app.set('trust proxy', parseTrustProxy());

const allowedOrigins = parseAllowedOrigins();
const allowedOriginPatterns = parseOriginPatterns();
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const originAllowedByPattern = origin
      ? allowedOriginPatterns.some((pattern) => matchesOriginPattern(origin, pattern))
      : false;

    if (!origin || allowedOrigins.includes(origin) || originAllowedByPattern) {
      callback(null, true);
      return;
    }

    console.warn(`Blocked CORS request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));


// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CSP middleware - MUST come BEFORE routes
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Test middleware route
app.get('/api/test-error', (req, res, next) => {
    const err = new Error('Test Error from Middleware');
    next(err);
});

// Error handler - MUST come LAST
app.use(errorHandler);

export default app;
