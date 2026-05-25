import 'dotenv/config';

export interface DatabaseConfig {
    postgresUrl?: string;
    postgresSsl: boolean;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
    postgresUrl: process.env.DATABASE_URL,
    postgresSsl: process.env.PG_SSL === 'true' || process.env.NODE_ENV === 'production',
});
