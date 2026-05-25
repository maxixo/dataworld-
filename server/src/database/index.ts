import { getDatabaseConfig } from '../config/database';
import { createPostgresRepositories } from './postgresRepositories';
import { getPostgresPool } from './postgres';

const { postgresUrl } = getDatabaseConfig();

if (!postgresUrl) {
    throw new Error('DATABASE_URL must be set.');
}

const postgresRepositories = createPostgresRepositories(getPostgresPool());

export const userRepository = postgresRepositories.userRepository;
export const datasetRepository = postgresRepositories.datasetRepository;
export const draftRepository = postgresRepositories.draftRepository;

export type { DatasetRepository, DraftRepository, UserRepository } from './repositories';
export type {
    AppUser,
    CreateDatasetInput,
    CreateDraftInput,
    CreateUserInput,
    DatasetListItem,
    DatasetRecord,
    DraftListType,
    DraftRecord,
    UpdateDraftInput,
    UpdateUserInput,
} from './types';
