"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPostgres = exports.connectPostgres = exports.getPostgresPool = void 0;
const pg_1 = require("pg");
const database_1 = require("../config/database");
let postgresPool = null;
const createPoolConfig = () => {
    const { postgresUrl, postgresSsl } = (0, database_1.getDatabaseConfig)();
    if (!postgresUrl) {
        throw new Error('DATABASE_URL must be set.');
    }
    return {
        connectionString: postgresUrl,
        ssl: postgresSsl ? { rejectUnauthorized: false } : undefined,
        max: process.env.PG_POOL_MAX ? parseInt(process.env.PG_POOL_MAX, 10) : 10,
    };
};
const getPostgresPool = () => {
    if (!postgresPool) {
        postgresPool = new pg_1.Pool(createPoolConfig());
    }
    return postgresPool;
};
exports.getPostgresPool = getPostgresPool;
const connectPostgres = async () => {
    const pool = (0, exports.getPostgresPool)();
    await pool.query('SELECT 1');
};
exports.connectPostgres = connectPostgres;
const disconnectPostgres = async () => {
    if (postgresPool) {
        await postgresPool.end();
        postgresPool = null;
    }
};
exports.disconnectPostgres = disconnectPostgres;
