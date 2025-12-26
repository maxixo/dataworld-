import mongoose from 'mongoose';

const DatasetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fileName: { type: String }, // Original file name
    fileSize: { type: Number }, // File size in bytes
    data: { type: Array, required: true }, // Store parsed JSON data
    columns: { type: Array, required: true },
    rowCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const Dataset = mongoose.model('Dataset', DatasetSchema);
