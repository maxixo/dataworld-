"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dataset = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DatasetSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileName: { type: String }, // Original file name
    fileSize: { type: Number }, // File size in bytes
    // Parsed JSON data (for non-encrypted uploads)
    data: [{ type: mongoose_1.default.Schema.Types.Mixed }],
    columns: [{ type: mongoose_1.default.Schema.Types.Mixed }],
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
exports.Dataset = mongoose_1.default.model('Dataset', DatasetSchema);
