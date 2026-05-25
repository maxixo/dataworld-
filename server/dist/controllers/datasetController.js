"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatasetBlob = exports.getDatasetById = exports.getDatasetHistory = exports.getDatasets = exports.uploadDataset = void 0;
const database_1 = require("../database");
const errorHandler_1 = require("../utils/errorHandler");
const uploadDataset = async (req, res) => {
    try {
        const { name, data, columns, rowCount, fileName, fileSize, encryptedBlobBase64, salt, iv, label, encryptedFileName, encryptedFileNameSalt, encryptedFileNameIv, mimeType } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await database_1.userRepository.findById(userId);
        if (!user) {
            return res.status(401).json({
                message: 'Session user was not found. Please log out and sign in again.'
            });
        }
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        if (!normalizedName) {
            return res.status(400).json({ message: 'Dataset name is required' });
        }
        const normalizedFileName = typeof fileName === 'string' && fileName.trim() ? fileName.trim() : normalizedName;
        const normalizedFileSize = Number.isFinite(Number(fileSize)) ? Number(fileSize) : 0;
        const newDataset = {
            userId,
            name: normalizedName,
            fileName: normalizedFileName,
            fileSize: normalizedFileSize,
            createdAt: new Date()
        };
        if (encryptedBlobBase64) {
            const buffer = Buffer.from(encryptedBlobBase64, 'base64');
            newDataset.encryptedBlob = buffer;
            newDataset.salt = salt;
            newDataset.iv = iv;
            newDataset.isEncrypted = true;
            newDataset.label = typeof label === 'string' ? label : null;
            newDataset.encryptedFileName = typeof encryptedFileName === 'string' ? encryptedFileName : null;
            newDataset.encryptedFileNameSalt = typeof encryptedFileNameSalt === 'string' ? encryptedFileNameSalt : null;
            newDataset.encryptedFileNameIv = typeof encryptedFileNameIv === 'string' ? encryptedFileNameIv : null;
            newDataset.mimeType = typeof mimeType === 'string' ? mimeType : null;
        }
        else {
            if (!Array.isArray(data) || data.length === 0) {
                return res.status(400).json({ message: 'Dataset data must be a non-empty array' });
            }
            const normalizedColumns = Array.isArray(columns)
                ? columns
                    .map((column) => String(column ?? '').trim())
                    .filter(Boolean)
                : [];
            if (normalizedColumns.length === 0) {
                return res.status(400).json({ message: 'Dataset columns must be a non-empty array' });
            }
            newDataset.data = data;
            newDataset.columns = normalizedColumns;
            const parsedRowCount = Number(rowCount);
            newDataset.rowCount = Number.isInteger(parsedRowCount) && parsedRowCount >= 0
                ? parsedRowCount
                : data.length;
        }
        const savedDataset = await database_1.datasetRepository.create(newDataset);
        res.json(savedDataset);
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'uploadDataset');
    }
};
exports.uploadDataset = uploadDataset;
const getDatasets = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const includeDetails = req.query.details === 'true';
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const datasets = await database_1.datasetRepository.listByUser(userId, {
            includeDetails,
            limit: includeDetails ? 50 : undefined,
        });
        res.json(datasets);
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getDatasets');
    }
};
exports.getDatasets = getDatasets;
const getDatasetHistory = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const datasets = await database_1.datasetRepository.listByUser(userId, {
            includeDetails: true,
            limit: 50,
        });
        res.json(datasets.map((dataset) => ({
            id: dataset.id,
            name: dataset.name,
            fileName: dataset.fileName,
            fileSize: dataset.fileSize ?? 0,
            rowCount: dataset.rowCount ?? 0,
            columns: Array.isArray(dataset.columns) ? dataset.columns : [],
            createdAt: dataset.createdAt,
            isEncrypted: dataset.isEncrypted,
            label: dataset.label ?? null,
        })));
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getDatasetHistory');
    }
};
exports.getDatasetHistory = getDatasetHistory;
const getDatasetById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const dataset = await database_1.datasetRepository.findById(id);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }
        if (dataset.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to dataset' });
        }
        res.json(dataset);
    }
    catch (err) {
        (0, errorHandler_1.handleError)(res, err, 'getDatasetById');
    }
};
exports.getDatasetById = getDatasetById;
const getDatasetBlob = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const dataset = await database_1.datasetRepository.findById(id);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }
        if (dataset.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (!dataset.isEncrypted || !dataset.encryptedBlob) {
            return res.status(400).json({ message: 'No encrypted blob available' });
        }
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
