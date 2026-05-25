CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    picture TEXT,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMPTZ,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    lock_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    refresh_tokens JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    data JSONB,
    columns JSONB,
    row_count INTEGER,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    label TEXT,
    salt TEXT,
    iv TEXT,
    encrypted_file_name TEXT,
    encrypted_file_name_salt TEXT,
    encrypted_file_name_iv TEXT,
    encrypted_blob BYTEA,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Draft',
    content TEXT NOT NULL DEFAULT '',
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    label TEXT,
    password_hash TEXT,
    password_salt TEXT,
    iv TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_datasets_user_created_at ON datasets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_user_updated_at ON drafts (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_user_deleted_updated ON drafts (user_id, is_deleted, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_user_encrypted_updated ON drafts (user_id, is_encrypted, updated_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_drafts_set_updated_at ON drafts;

CREATE TRIGGER trg_drafts_set_updated_at
BEFORE UPDATE ON drafts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
