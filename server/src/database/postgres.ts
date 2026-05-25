import { Pool, PoolConfig } from 'pg';
import { getDatabaseConfig } from '../config/database';

let postgresPool: Pool | null = null;

const createPoolConfig = (): PoolConfig => {
    const { postgresUrl, postgresSsl } = getDatabaseConfig();

    if (!postgresUrl) {
        throw new Error('DATABASE_URL must be set.');
    }

    return {
        connectionString: postgresUrl,
        ssl: postgresSsl ? { rejectUnauthorized: false } : undefined,
        max: process.env.PG_POOL_MAX ? parseInt(process.env.PG_POOL_MAX, 10) : 10,
    };
};

export const getPostgresPool = () => {
    if (!postgresPool) {
        postgresPool = new Pool(createPoolConfig());
    }

    return postgresPool;
};

export const connectPostgres = async () => {
    const pool = getPostgresPool();
    await pool.query('SELECT 1');
};

export const disconnectPostgres = async () => {
    if (postgresPool) {
        await postgresPool.end();
        postgresPool = null;
    }
};
