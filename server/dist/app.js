"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const datasets_1 = __importDefault(require("./routes/datasets"));
const drafts_1 = __importDefault(require("./routes/drafts"));
const error_1 = require("./middleware/error");
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
const app = (0, express_1.default)();
if (isProduction) {
    app.set('trust proxy', 1);
}
const allowedOrigins = [
    'https://dataworld-production.up.railway.app',
    'https://dataworld-xx.vercel.app',
    'https://dataworld-client-fx4l4dktk-maxixos-projects.vercel.app',
];
if (!isProduction) {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174');
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// CSP middleware - MUST come BEFORE routes
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' https:;");
    next();
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/datasets', datasets_1.default);
app.use('/api/drafts', drafts_1.default);
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
app.use(error_1.errorHandler);
exports.default = app;
