import mongoose from 'mongoose';

const DatasetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileName: { type: String }, // Original file name
    fileSize: { type: Number }, // File size in bytes
    // Parsed JSON data (for non-encrypted uploads)
    data: { type: Array },
    columns: { type: Array },
    rowCount: { type: Number },
    // Encrypted file metadata (for encrypted uploads)
    isLocked: { type: Boolean, default: false },
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

export const Dataset = mongoose.model('Dataset', DatasetSchema);
