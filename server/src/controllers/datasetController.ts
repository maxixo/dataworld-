import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Dataset, IDataset } from '../models/Dataset';
import { AuthRequest } from '../middleware/auth';
import { handleError } from '../utils/errorHandler';

// Define proper document type
interface DatasetDocument extends IDataset {
  _id: Types.ObjectId;
}

export const uploadDataset = async (req: AuthRequest, res: Response) => {
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
            isEncrypted,
            label,
            encryptedFileName,
            encryptedFileNameSalt,
            encryptedFileNameIv,
            mimeType
        } = req.body;
        const userId = req.user?.userId;

        const newDataset: Partial<IDataset> & { user?: string } = {
            user: userId,
            name,
            fileName: fileName || name,
            fileSize: fileSize || 0,
            createdAt: new Date()
        };

        if (encryptedBlobBase64) {
            console.log('🔥 [SERVER] Received encrypted upload - salt:', salt, 'iv:', iv, 'encryptedFilename:', encryptedFileName, 'nameS:', encryptedFileNameSalt, 'nameIv:', encryptedFileNameIv);
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
            console.log('✓ [SERVER] About to store - newDataset fields:', { 
                salt: newDataset.salt, 
                iv: newDataset.iv, 
                encryptedFileName: newDataset.encryptedFileName,
                encryptedFileNameSalt: newDataset.encryptedFileNameSalt,
                encryptedFileNameIv: newDataset.encryptedFileNameIv
            });
        } else {
            // Store parsed data
            newDataset.data = data;
            newDataset.columns = columns;
            newDataset.rowCount = rowCount;
        }

        const savedDataset = await Dataset.create(newDataset) as DatasetDocument;
        
        if (encryptedBlobBase64) {
            console.log('✓ [SERVER] Saved to DB - datasetId:', savedDataset._id);
            console.log('  - salt:', savedDataset.salt);
            console.log('  - iv:', savedDataset.iv);
            console.log('  - encryptedFileName:', savedDataset.encryptedFileName);
            console.log('  - encryptedFileNameSalt:', savedDataset.encryptedFileNameSalt);
            console.log('  - encryptedFileNameIv:', savedDataset.encryptedFileNameIv);
            console.log('  - isEncrypted:', savedDataset.isEncrypted);
        }

        res.json(savedDataset);
    } catch (err) {
        handleError(res, err, 'uploadDataset');
    }
};

// Consolidated endpoint to get datasets with optional details
export const getDatasets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const includeDetails = req.query.details === 'true';
        
        // Select fields based on request
        const select = includeDetails 
            ? 'name fileName fileSize rowCount columns createdAt isEncrypted label'
            : 'name fileName fileSize isEncrypted label createdAt';
        
        let query = Dataset.find({ user: userId })
            .select(select)
            .sort({ createdAt: -1 });
        
        // Limit results for detailed queries
        if (includeDetails) {
            query = query.limit(50);
        }
        
        const datasets = includeDetails
            ? await query.lean<DatasetDocument[]>()
            : await query.lean<Pick<IDataset, 'name' | 'fileName' | 'fileSize' | 'isEncrypted' | 'label' | 'createdAt'>[]>();
        
        res.json(datasets);
    } catch (err) {
        handleError(res, err, 'getDatasets');
    }
};

export const getDatasetById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const userId = req.user?.userId;

        const dataset = await Dataset.findById(id).lean<DatasetDocument | null>();
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }

        // Check ownership - users can only access their own datasets
        if (dataset && dataset.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to dataset' });
        }

        res.json(dataset);
    } catch (err) {
        handleError(res, err, 'getDatasetById');
    }
};

// Return encrypted blob and metadata (base64) for client-side decryption
export const getDatasetBlob = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const userId = req.user?.userId;

        const dataset = await Dataset.findById(id).lean<DatasetDocument | null>();
        
        if (!dataset) {
            console.log('❌ [SERVER] Dataset not found:', id);
            return res.status(404).json({ message: 'Dataset not found' });
        }

        console.log('📤 [SERVER] Retrieved dataset from DB');
        console.log('  - _id:', dataset._id);
        console.log('  - isEncrypted:', dataset.isEncrypted);
        console.log('  - salt:', dataset.salt);
        console.log('  - iv:', dataset.iv);
        console.log('  - encryptedFileName:', dataset.encryptedFileName);
        console.log('  - encryptedFileNameSalt:', dataset.encryptedFileNameSalt);
        console.log('  - encryptedFileNameIv:', dataset.encryptedFileNameIv);
        console.log('  - mimeType:', dataset.mimeType);
        console.log('  - encryptedBlob exists:', !!dataset.encryptedBlob);
        console.log('  - encryptedBlob size:', dataset.encryptedBlob?.length);

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
            console.log('📤 [SERVER] Sending encrypted blob and metadata in JSON');
            const encryptedBase64 = dataset.encryptedBlob.toString('base64');
            console.log('✓ [SERVER] JSON response prepared - blob size:', encryptedBase64.length);
            
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

        console.log('📤 [SERVER] Sending JSON response with metadata');
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
