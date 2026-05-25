import { Response } from 'express';
import { datasetRepository, userRepository } from '../database';
import { AuthRequest } from '../middleware/auth';
import { handleError } from '../utils/errorHandler';

export const uploadDataset = async (req: AuthRequest, res: Response) => {
    try {
        const {
            name,
            data,
            columns,
            rowCount,
            fileName,
            fileSize,
            encryptedBlobBase64,
            salt,
            iv,
            label,
            encryptedFileName,
            encryptedFileNameSalt,
            encryptedFileNameIv,
            mimeType
        } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await userRepository.findById(userId);

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

        const newDataset: any = {
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
        } else {
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

        const savedDataset = await datasetRepository.create(newDataset);

        res.json(savedDataset);
    } catch (err) {
        handleError(res, err, 'uploadDataset');
    }
};

export const getDatasets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const includeDetails = req.query.details === 'true';

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const datasets = await datasetRepository.listByUser(userId, {
            includeDetails,
            limit: includeDetails ? 50 : undefined,
        });

        res.json(datasets);
    } catch (err) {
        handleError(res, err, 'getDatasets');
    }
};

export const getDatasetHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const datasets = await datasetRepository.listByUser(userId, {
            includeDetails: true,
            limit: 50,
        });

        res.json(
            datasets.map((dataset) => ({
                id: dataset.id,
                name: dataset.name,
                fileName: dataset.fileName,
                fileSize: dataset.fileSize ?? 0,
                rowCount: dataset.rowCount ?? 0,
                columns: Array.isArray(dataset.columns) ? dataset.columns : [],
                createdAt: dataset.createdAt,
                isEncrypted: dataset.isEncrypted,
                label: dataset.label ?? null,
            }))
        );
    } catch (err) {
        handleError(res, err, 'getDatasetHistory');
    }
};

export const getDatasetById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const dataset = await datasetRepository.findById(id);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }

        if (dataset.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to dataset' });
        }

        res.json(dataset);
    } catch (err) {
        handleError(res, err, 'getDatasetById');
    }
};

export const getDatasetBlob = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const dataset = await datasetRepository.findById(id);

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
    } catch (err) {
        handleError(res, err, 'getDatasetBlob');
    }
};
