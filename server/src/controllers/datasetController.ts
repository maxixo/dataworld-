import { Request, Response } from 'express';
import { Dataset } from '../models/Dataset';

export const uploadDataset = async (req: Request, res: Response) => {
    try {
        const {
            name,
            data,
            columns,
            rowCount,
            fileName,
            fileSize,
            // encrypted upload fields
            encryptedBlobBase64,
            salt,
            iv,
            isLocked,
            label,
            encryptedFileName,
            encryptedFileNameSalt,
            encryptedFileNameIv,
            mimeType
        } = req.body;
        // @ts-ignore
        const userId = req.user.userId;

        const newDataset: any = {
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
            newDataset.salt = salt || null;
            newDataset.iv = iv || null;
            newDataset.isLocked = !!isLocked;
            newDataset.label = label || null;
            newDataset.encryptedFileName = encryptedFileName || null;
            newDataset.encryptedFileNameSalt = encryptedFileNameSalt || null;
            newDataset.encryptedFileNameIv = encryptedFileNameIv || null;
            newDataset.mimeType = mimeType || null;
        } else {
            // Store parsed data
            newDataset.data = data;
            newDataset.columns = columns;
            newDataset.rowCount = rowCount;
        }

        const savedDataset = await Dataset.create(newDataset);

        res.json(savedDataset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getDatasets = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;

        // Return a lightweight list (exclude encryptedBlob and data)
        const datasets = await Dataset.find({ user: userId })
            .select('name fileName fileSize isLocked label createdAt updatedAt');
        res.json(datasets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get user's upload history
export const getUploadHistory = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;

        const history = await Dataset.find({ user: userId })
            .select('name fileName fileSize rowCount columns createdAt')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 uploads

        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getDatasetById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const userId = req.user.userId;

        const dataset = await Dataset.findById(id);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }

        // Check ownership - users can only access their own datasets
        if (dataset.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to dataset' });
        }

        res.json(dataset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Return encrypted blob and metadata (base64) for client-side decryption
export const getDatasetBlob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore
        const userId = req.user.userId;

        const dataset: any = await Dataset.findById(id).select('user isLocked label encryptedBlob salt iv encryptedFileName encryptedFileNameSalt encryptedFileNameIv mimeType');
        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

        if (dataset.user.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

        if (!dataset.isLocked || !dataset.encryptedBlob) return res.status(400).json({ message: 'No encrypted blob available' });

        // If client requests raw binary (faster for large files), stream the buffer
        const raw = req.query.raw === '1' || req.query.raw === 'true';
        if (raw) {
            // Set metadata headers (small, safe metadata)
            if (dataset.salt) res.setHeader('x-salt', dataset.salt);
            if (dataset.iv) res.setHeader('x-iv', dataset.iv);
            if (dataset.encryptedFileName) res.setHeader('x-encrypted-filename', dataset.encryptedFileName);
            if (dataset.encryptedFileNameSalt) res.setHeader('x-encrypted-filename-salt', dataset.encryptedFileNameSalt);
            if (dataset.encryptedFileNameIv) res.setHeader('x-encrypted-filename-iv', dataset.encryptedFileNameIv);
            if (dataset.mimeType) res.setHeader('content-type', dataset.mimeType);

            return res.send(dataset.encryptedBlob);
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
        console.error(err);
        res.status(500).send('Server Error');
    }
};
