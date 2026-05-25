"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const postgres_1 = require("./database/postgres");
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    console.error('Please add JWT_SECRET to your .env file');
    process.exit(1);
}
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const { postgresUrl } = (0, database_1.getDatabaseConfig)();
if (isNaN(PORT)) {
    console.error('FATAL ERROR: PORT must be a valid number.');
    process.exit(1);
}
if (!postgresUrl) {
    console.error('FATAL ERROR: DATABASE_URL must be set.');
    process.exit(1);
}
const connectDB = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to connect to PostgreSQL... (Attempt ${i + 1}/${retries})`);
            await (0, postgres_1.connectPostgres)();
            console.log('Successfully connected to PostgreSQL');
            return;
        }
        catch (err) {
            console.error(`PostgreSQL connection attempt ${i + 1} failed:`, err.message);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('CRITICAL: Failed to connect to PostgreSQL after multiple attempts');
    console.error('Server will continue running but database features will not work');
    console.error('Please check:');
    console.error('1. DATABASE_URL');
    console.error('2. PostgreSQL server status');
    console.error('3. SSL requirements for your provider');
    console.error('4. Firewall or network restrictions');
};
connectDB();
process.on('SIGINT', async () => {
    await (0, postgres_1.disconnectPostgres)();
    process.exit(0);
});
app_1.default.listen(PORT, '0.0.0.0', () => {
    console.log(`API server listening on port ${PORT}`);
});
