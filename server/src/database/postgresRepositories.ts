import crypto from 'crypto';
import { Pool } from 'pg';
import { DatasetRepository, DraftRepository, UserRepository } from './repositories';
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

const createObjectIdLike = () => crypto.randomBytes(12).toString('hex');

const mapUser = (row: any, includePassword = false): AppUser => ({
    id: row.id,
    username: row.username,
    email: row.email,
    ...(includePassword ? { password: row.password ?? null } : {}),
    googleId: row.google_id ?? null,
    picture: row.picture ?? null,
    createdAt: row.created_at,
});

const mapDataset = (row: any): DatasetRecord => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    fileName: row.file_name ?? null,
    fileSize: row.file_size ?? null,
    data: row.data ?? null,
    columns: row.columns ?? null,
    rowCount: row.row_count ?? null,
    isEncrypted: Boolean(row.is_encrypted),
    label: row.label ?? null,
    salt: row.salt ?? null,
    iv: row.iv ?? null,
    encryptedFileName: row.encrypted_file_name ?? null,
    encryptedFileNameSalt: row.encrypted_file_name_salt ?? null,
    encryptedFileNameIv: row.encrypted_file_name_iv ?? null,
    encryptedBlob: row.encrypted_blob ?? null,
    mimeType: row.mime_type ?? null,
    createdAt: row.created_at,
});

const mapDatasetListItem = (row: any, includeDetails: boolean): DatasetListItem => ({
    id: row.id,
    name: row.name,
    fileName: row.file_name ?? null,
    fileSize: row.file_size ?? null,
    ...(includeDetails ? { rowCount: row.row_count ?? null, columns: row.columns ?? null } : {}),
    createdAt: row.created_at,
    isEncrypted: Boolean(row.is_encrypted),
    label: row.label ?? null,
});

const mapDraft = (row: any): DraftRecord => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    isEncrypted: Boolean(row.is_encrypted),
    label: row.label ?? null,
    passwordHash: row.password_hash ?? null,
    passwordSalt: row.password_salt ?? null,
    iv: row.iv ?? null,
    isDeleted: Boolean(row.is_deleted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const buildDraftListFilter = (type: DraftListType) => {
    if (type === 'trash') {
        return {
            clause: 'is_deleted = TRUE',
            values: [] as unknown[],
        };
    }

    if (type === 'locked-notes') {
        return {
            clause: 'is_encrypted = TRUE AND is_deleted = FALSE',
            values: [] as unknown[],
        };
    }

    return {
        clause: 'is_deleted = FALSE AND is_encrypted = FALSE',
        values: [] as unknown[],
    };
};

export const createPostgresRepositories = (pool: Pool): {
    userRepository: UserRepository;
    datasetRepository: DatasetRepository;
    draftRepository: DraftRepository;
} => {
    const userRepository: UserRepository = {
        async findById(id) {
            const result = await pool.query(
                `SELECT id, username, email, google_id, picture, created_at
                 FROM users
                 WHERE id = $1
                 LIMIT 1`,
                [id]
            );

            return result.rows[0] ? mapUser(result.rows[0]) : null;
        },

        async findByEmail(email, options = {}) {
            const passwordField = options.includePassword ? ', password' : '';
            const result = await pool.query(
                `SELECT id, username, email, google_id, picture, created_at${passwordField}
                 FROM users
                 WHERE email = $1
                 LIMIT 1`,
                [email]
            );

            return result.rows[0] ? mapUser(result.rows[0], Boolean(options.includePassword)) : null;
        },

        async findByEmailOrGoogleId(email, googleId) {
            const result = await pool.query(
                `SELECT id, username, email, google_id, picture, created_at
                 FROM users
                 WHERE email = $1 OR google_id = $2
                 LIMIT 1`,
                [email, googleId]
            );

            return result.rows[0] ? mapUser(result.rows[0]) : null;
        },

        async create(input: CreateUserInput) {
            const id = createObjectIdLike();
            const result = await pool.query(
                `INSERT INTO users (id, username, email, password, google_id, picture)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, username, email, google_id, picture, created_at`,
                [
                    id,
                    input.username,
                    input.email,
                    input.password ?? null,
                    input.googleId ?? null,
                    input.picture ?? null,
                ]
            );

            return mapUser(result.rows[0]);
        },

        async update(id: string, input: UpdateUserInput) {
            const sets: string[] = [];
            const values: unknown[] = [];

            if (input.username !== undefined) {
                sets.push(`username = $${values.length + 1}`);
                values.push(input.username);
            }

            if (input.email !== undefined) {
                sets.push(`email = $${values.length + 1}`);
                values.push(input.email);
            }

            if (input.googleId !== undefined) {
                sets.push(`google_id = $${values.length + 1}`);
                values.push(input.googleId);
            }

            if (input.picture !== undefined) {
                sets.push(`picture = $${values.length + 1}`);
                values.push(input.picture);
            }

            if (sets.length === 0) {
                const existing = await pool.query(
                    `SELECT id, username, email, google_id, picture, created_at
                     FROM users
                     WHERE id = $1
                     LIMIT 1`,
                    [id]
                );
                return existing.rows[0] ? mapUser(existing.rows[0]) : null;
            }

            values.push(id);

            const result = await pool.query(
                `UPDATE users
                 SET ${sets.join(', ')}
                 WHERE id = $${values.length}
                 RETURNING id, username, email, google_id, picture, created_at`,
                values
            );

            return result.rows[0] ? mapUser(result.rows[0]) : null;
        },
    };

    const datasetRepository: DatasetRepository = {
        async create(input: CreateDatasetInput) {
            const id = createObjectIdLike();
            const result = await pool.query(
                `INSERT INTO datasets (
                    id, user_id, name, file_name, file_size, data, columns, row_count,
                    is_encrypted, label, salt, iv, encrypted_file_name,
                    encrypted_file_name_salt, encrypted_file_name_iv, encrypted_blob,
                    mime_type, created_at
                 ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13,
                    $14, $15, $16, $17, $18
                 )
                 RETURNING *`,
                [
                    id,
                    input.userId,
                    input.name,
                    input.fileName ?? null,
                    input.fileSize ?? null,
                    input.data !== undefined && input.data !== null ? JSON.stringify(input.data) : null,
                    input.columns !== undefined && input.columns !== null ? JSON.stringify(input.columns) : null,
                    input.rowCount ?? null,
                    input.isEncrypted ?? false,
                    input.label ?? null,
                    input.salt ?? null,
                    input.iv ?? null,
                    input.encryptedFileName ?? null,
                    input.encryptedFileNameSalt ?? null,
                    input.encryptedFileNameIv ?? null,
                    input.encryptedBlob ?? null,
                    input.mimeType ?? null,
                    input.createdAt ?? new Date(),
                ]
            );

            return mapDataset(result.rows[0]);
        },

        async listByUser(userId: string, options: { includeDetails: boolean; limit?: number }) {
            const fields = options.includeDetails
                ? 'id, name, file_name, file_size, row_count, columns, created_at, is_encrypted, label'
                : 'id, name, file_name, file_size, created_at, is_encrypted, label';

            const values: unknown[] = [userId];
            let sql = `
                SELECT ${fields}
                FROM datasets
                WHERE user_id = $1
                ORDER BY created_at DESC
            `;

            if (options.includeDetails && options.limit) {
                values.push(options.limit);
                sql += ` LIMIT $${values.length}`;
            }

            const result = await pool.query(sql, values);
            return result.rows.map((row) => mapDatasetListItem(row, options.includeDetails));
        },

        async findById(id: string) {
            const result = await pool.query('SELECT * FROM datasets WHERE id = $1 LIMIT 1', [id]);
            return result.rows[0] ? mapDataset(result.rows[0]) : null;
        },
    };

    const draftRepository: DraftRepository = {
        async create(input: CreateDraftInput) {
            const id = createObjectIdLike();
            const result = await pool.query(
                `INSERT INTO drafts (
                    id, user_id, title, content, is_encrypted,
                    label, password_hash, password_salt, iv
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [
                    id,
                    input.userId,
                    input.title ?? 'Untitled Draft',
                    input.content ?? '',
                    input.isEncrypted ?? false,
                    input.label ?? null,
                    input.passwordHash ?? null,
                    input.passwordSalt ?? null,
                    input.iv ?? null,
                ]
            );

            return mapDraft(result.rows[0]);
        },

        async listByUser(userId: string, type: DraftListType) {
            const filter = buildDraftListFilter(type);
            const result = await pool.query(
                `SELECT *
                 FROM drafts
                 WHERE user_id = $1 AND ${filter.clause}
                 ORDER BY updated_at DESC`,
                [userId, ...filter.values]
            );

            return result.rows.map(mapDraft);
        },

        async findByIdForUser(id: string, userId: string) {
            const result = await pool.query(
                `SELECT *
                 FROM drafts
                 WHERE id = $1 AND user_id = $2
                 LIMIT 1`,
                [id, userId]
            );

            return result.rows[0] ? mapDraft(result.rows[0]) : null;
        },

        async updateByIdForUser(id: string, userId: string, input: UpdateDraftInput) {
            const sets: string[] = [];
            const values: unknown[] = [];

            if (input.title !== undefined) {
                sets.push(`title = $${values.length + 1}`);
                values.push(input.title);
            }

            if (input.content !== undefined) {
                sets.push(`content = $${values.length + 1}`);
                values.push(input.content);
            }

            if (input.isEncrypted !== undefined) {
                sets.push(`is_encrypted = $${values.length + 1}`);
                values.push(input.isEncrypted);
            }

            if (input.label !== undefined) {
                sets.push(`label = $${values.length + 1}`);
                values.push(input.label);
            }

            if (input.passwordHash !== undefined) {
                sets.push(`password_hash = $${values.length + 1}`);
                values.push(input.passwordHash);
            }

            if (input.passwordSalt !== undefined) {
                sets.push(`password_salt = $${values.length + 1}`);
                values.push(input.passwordSalt);
            }

            if (input.iv !== undefined) {
                sets.push(`iv = $${values.length + 1}`);
                values.push(input.iv);
            }

            sets.push(`updated_at = $${values.length + 1}`);
            values.push(input.updatedAt);
            values.push(id, userId);

            const result = await pool.query(
                `UPDATE drafts
                 SET ${sets.join(', ')}
                 WHERE id = $${values.length - 1} AND user_id = $${values.length}
                 RETURNING *`,
                values
            );

            return result.rows[0] ? mapDraft(result.rows[0]) : null;
        },

        async softDeleteByIdForUser(id: string, userId: string) {
            const result = await pool.query(
                `UPDATE drafts
                 SET is_deleted = TRUE, updated_at = NOW()
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [id, userId]
            );

            return result.rows[0] ? mapDraft(result.rows[0]) : null;
        },

        async restoreByIdForUser(id: string, userId: string) {
            const result = await pool.query(
                `UPDATE drafts
                 SET is_deleted = FALSE, updated_at = NOW()
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [id, userId]
            );

            return result.rows[0] ? mapDraft(result.rows[0]) : null;
        },

        async deleteByIdForUser(id: string, userId: string) {
            const result = await pool.query(
                `DELETE FROM drafts
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [id, userId]
            );

            return result.rows[0] ? mapDraft(result.rows[0]) : null;
        },

        async bulkPermanentDeleteTrashed(userId: string, ids: string[]) {
            const result = await pool.query(
                `DELETE FROM drafts
                 WHERE user_id = $1
                   AND is_deleted = TRUE
                   AND id = ANY($2::text[])
                 RETURNING id`,
                [userId, ids]
            );

            return result.rows.map((row) => row.id);
        },
    };

    return {
        userRepository,
        datasetRepository,
        draftRepository,
    };
};
