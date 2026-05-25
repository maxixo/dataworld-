"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
require("dotenv/config");
const getDatabaseConfig = () => ({
    postgresUrl: process.env.DATABASE_URL,
    postgresSsl: process.env.PG_SSL === 'true',
});
exports.getDatabaseConfig = getDatabaseConfig;
