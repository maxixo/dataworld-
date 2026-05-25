export interface AppUser {
    id: string;
    username: string;
    email: string;
    password?: string | null;
    googleId?: string | null;
    picture?: string | null;
    createdAt?: Date;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password?: string | null;
    googleId?: string | null;
    picture?: string | null;
}

export interface UpdateUserInput {
    username?: string;
    email?: string;
    googleId?: string | null;
    picture?: string | null;
}

export interface DatasetRecord {
    id: string;
    userId: string;
    name: string;
    fileName?: string | null;
    fileSize?: number | null;
    data?: unknown[] | null;
    columns?: unknown[] | null;
    rowCount?: number | null;
    isEncrypted: boolean;
    label?: string | null;
    salt?: string | null;
    iv?: string | null;
    encryptedFileName?: string | null;
    encryptedFileNameSalt?: string | null;
    encryptedFileNameIv?: string | null;
    encryptedBlob?: Buffer | null;
    mimeType?: string | null;
    createdAt: Date;
}

export interface DatasetListItem {
    id: string;
    name: string;
    fileName?: string | null;
    fileSize?: number | null;
    rowCount?: number | null;
    columns?: unknown[] | null;
    createdAt: Date;
    isEncrypted: boolean;
    label?: string | null;
}

export interface CreateDatasetInput {
    userId: string;
    name: string;
    fileName?: string | null;
    fileSize?: number | null;
    data?: unknown[] | null;
    columns?: unknown[] | null;
    rowCount?: number | null;
    isEncrypted?: boolean;
    label?: string | null;
    salt?: string | null;
    iv?: string | null;
    encryptedFileName?: string | null;
    encryptedFileNameSalt?: string | null;
    encryptedFileNameIv?: string | null;
    encryptedBlob?: Buffer | null;
    mimeType?: string | null;
    createdAt?: Date;
}

export interface DraftRecord {
    id: string;
    userId: string;
    title: string;
    content: string;
    isEncrypted: boolean;
    label?: string | null;
    passwordHash?: string | null;
    passwordSalt?: string | null;
    iv?: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateDraftInput {
    userId: string;
    title?: string;
    content?: string;
    isEncrypted?: boolean;
    label?: string | null;
    passwordHash?: string | null;
    passwordSalt?: string | null;
    iv?: string | null;
}

export interface UpdateDraftInput {
    title?: string;
    content?: string;
    isEncrypted?: boolean;
    label?: string | null;
    passwordHash?: string | null;
    passwordSalt?: string | null;
    iv?: string | null;
    updatedAt: Date;
}

export type DraftListType = 'drafts' | 'locked-notes' | 'trash';
