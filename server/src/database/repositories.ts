import {
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

export interface UserRepository {
    findById(id: string): Promise<AppUser | null>;
    findByEmail(email: string, options?: { includePassword?: boolean }): Promise<AppUser | null>;
    findByEmailOrGoogleId(email: string, googleId: string): Promise<AppUser | null>;
    create(input: CreateUserInput): Promise<AppUser>;
    update(id: string, input: UpdateUserInput): Promise<AppUser | null>;
}

export interface DatasetRepository {
    create(input: CreateDatasetInput): Promise<DatasetRecord>;
    listByUser(userId: string, options: { includeDetails: boolean; limit?: number }): Promise<DatasetListItem[]>;
    findById(id: string): Promise<DatasetRecord | null>;
}

export interface DraftRepository {
    create(input: CreateDraftInput): Promise<DraftRecord>;
    listByUser(userId: string, type: DraftListType): Promise<DraftRecord[]>;
    findByIdForUser(id: string, userId: string): Promise<DraftRecord | null>;
    updateByIdForUser(id: string, userId: string, input: UpdateDraftInput): Promise<DraftRecord | null>;
    softDeleteByIdForUser(id: string, userId: string): Promise<DraftRecord | null>;
    restoreByIdForUser(id: string, userId: string): Promise<DraftRecord | null>;
    deleteByIdForUser(id: string, userId: string): Promise<DraftRecord | null>;
    bulkPermanentDeleteTrashed(userId: string, ids: string[]): Promise<string[]>;
}
