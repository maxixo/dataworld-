"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatasetBlob = exports.getDatasetById = exports.getDatasets = exports.uploadDataset = void 0;
const Dataset_1 = require("../models/Dataset");
const errorHandler_1 = require("../utils/errorHandler");
const uploadDataset = async (req, res) => {
    try {
        const { name, data, columns, rowCount, fileName, fileSize, 
        // encrypted upload fields
        encryptedBlobBase64, salt, iv, isEncrypted, label, encryptedFileName, encryptedFileNameSalt, encryptedFileNameIv, mimeType } = req.body;
        const userId = req.user?.userId;
        const newDataset = {
            user: userId,
            name,
            fileName: fileName || name,
            fileSize: fileSize || 0,
            createdAt: new Date()
        };
        if (encryptedBlobBase64) {
            // Store encrypted blob and metadata
            const buffer = Buffer.from(encryptedBlobBase64, 'base64');
            newDataset.encryptedBlob = buffer;
            newDataset.salt = salt;
            newDataset.iv = iv;
            newDataset.isEncrypted = true;
            newDataset.label = label;
            newDataset.encryptedFileName = encryptedFileName;
            newDataset.encryptedFileNameSalt = encryptedFileNameSalt;
            newDataset.encryptedFileNameIv = encryptedFileNameIv;
            newDataset.mimeType = mimeType;
        }
        else {
            // Store parsed data
            newDataset.data = data;
            newDataset.columns = columns;
            newDataset.rowCount = rowCount;
        }
        const savedDataset = await Dataset_1.Dataset.create(newDataset);
        res.json(savedDataset);
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'uploadDataset');
    }
};
exports.uploadDataset = uploadDataset;
// Consolidated endpoint to get datasets with optional details
const getDatasets = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const includeDetails = req.query.details === 'true';
        // Select fields based on request
        const select = includeDetails
            ? 'name fileName fileSize rowCount columns createdAt isEncrypted label'
            : 'name fileName fileSize isEncrypted label createdAt';
        let query = Dataset_1.Dataset.find({ user: userId })
            .select(select)
            .sort({ createdAt: -1 });
        // Limit results for detailed queries
        if (includeDetails) {
            query = query.limit(50);
        }
        const datasets = includeDetails
            ? await query.lean()
            : await query.lean();
        res.json(datasets);
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getDatasets');
    }
};
exports.getDatasets = getDatasets;
const getDatasetById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const dataset = await Dataset_1.Dataset.findById(id).lean();
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }
        // Check ownership - users can only access their own datasets
        if (dataset && dataset.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to dataset' });
        }
        res.json(dataset);
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getDatasetById');
    }
};
exports.getDatasetById = getDatasetById;
// Return encrypted blob and metadata (base64) for client-side decryption
const getDatasetBlob = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const dataset = await Dataset_1.Dataset.findById(id).lean();
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }
        if (dataset.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (!dataset.isEncrypted || !dataset.encryptedBlob) {
            return res.status(400).json({ message: 'No encrypted blob available' });
        }
        // If client requests raw binary, return metadata in JSON body instead of headers
        // This ensures reliable metadata transmission (headers can be lost/modified by proxies)
        const raw = req.query.raw === '1' || req.query.raw === 'true';
        if (raw) {
            const encryptedBase64 = dataset.encryptedBlob.toString('base64');
            return res.json({
                blob: encryptedBase64,
                salt: dataset.salt,
                iv: dataset.iv,
                encryptedFileName: dataset.encryptedFileName,
                encryptedFileNameSalt: dataset.encryptedFileNameSalt,
                encryptedFileNameIv: dataset.encryptedFileNameIv,
                mimeType: dataset.mimeType
            });
        }
        const encryptedBase64 = dataset.encryptedBlob.toString('base64');
        res.json({
            encryptedBlobBase64: encryptedBase64,
            salt: dataset.salt,
            iv: dataset.iv,
            encryptedFileName: dataset.encryptedFileName,
            encryptedFileNameSalt: dataset.encryptedFileNameSalt,
            encryptedFileNameIv: dataset.encryptedFileNameIv,
            mimeType: dataset.mimeType
        });
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getDatasetBlob');
    }
};
exports.getDatasetBlob = getDatasetBlob;
