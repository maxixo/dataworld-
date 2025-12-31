import { Request, Response } from 'express';
import { Dataset } from '../models/Dataset';

export const uploadDataset = async (req: Request, res: Response) => {
    try {
        const { name, data, columns, rowCount, fileName, fileSize } = req.body;
        // @ts-ignore
        const userId = req.user.userId;

        const newDataset = new Dataset({
            user: userId,
            name,
            fileName: fileName || name,
            fileSize: fileSize || 0,
            data,
            columns,
            rowCount
        });

        const savedDataset = await newDataset.save();

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

        // Try to fetch specific user lists from cache if you implement list caching
        // For now, simple DB fetch
        const datasets = await Dataset.find({ user: userId }).select('-data'); // Don't send full data for list
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
