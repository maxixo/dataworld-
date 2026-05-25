"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draftRepository = exports.datasetRepository = exports.userRepository = void 0;
const database_1 = require("../config/database");
const postgresRepositories_1 = require("./postgresRepositories");
const postgres_1 = require("./postgres");
const { postgresUrl } = (0, database_1.getDatabaseConfig)();
if (!postgresUrl) {
    throw new Error('DATABASE_URL must be set.');
}
const postgresRepositories = (0, postgresRepositories_1.createPostgresRepositories)((0, postgres_1.getPostgresPool)());
exports.userRepository = postgresRepositories.userRepository;
exports.datasetRepository = postgresRepositories.datasetRepository;
exports.draftRepository = postgresRepositories.draftRepository;
