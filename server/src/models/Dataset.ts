import mongoose, { Document } from 'mongoose';

const DatasetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileName: { type: String }, // Original file name
    fileSize: { type: Number }, // File size in bytes
    // Parsed JSON data (for non-encrypted uploads)
    data: [{ type: mongoose.Schema.Types.Mixed }],
    columns: [{ type: mongoose.Schema.Types.Mixed }],
    rowCount: { type: Number },
    // Encrypted file metadata (for encrypted uploads)
    isEncrypted: { type: Boolean, default: false },
    label: { type: String, default: null },
    salt: { type: String, default: null },
    iv: { type: String, default: null },
    encryptedFileName: { type: String, default: null },
    encryptedFileNameSalt: { type: String, default: null },
    encryptedFileNameIv: { type: String, default: null },
    encryptedBlob: { type: Buffer, default: null },
    mimeType: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

// TypeScript interface for Dataset document
export interface IDataset extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    fileName?: string | null;
    fileSize?: number | null;
    data?: any[];
    columns?: any[];
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

export const Dataset = mongoose.model<IDataset>('Dataset', DatasetSchema);
