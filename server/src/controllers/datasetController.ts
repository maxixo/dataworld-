import { Request, Response } from 'express';
import { Dataset } from '../models/Dataset';
import redisClient from '../config/redis';

export const uploadDataset = async (req: Request, res: Response) => {
    try {
        const { name, data, columns, rowCount } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        const newDataset = new Dataset({
            user: userId,
            name,
            data,
            columns,
            rowCount
        });

        const savedDataset = await newDataset.save();

        // Cache the new dataset
        await redisClient.setex(`dataset:${savedDataset.id}`, 3600, JSON.stringify(savedDataset));

        res.json(savedDataset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getDatasets = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        // Try to fetch specific user lists from cache if you implement list caching
        // For now, simple DB fetch
        const datasets = await Dataset.find({ user: userId }).select('-data'); // Don't send full data for list
        res.json(datasets);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getDatasetById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check cache
        const cachedDataset = await redisClient.get(`dataset:${id}`);
        if (cachedDataset) {
            console.log('Serving from cache');
            return res.json(JSON.parse(cachedDataset));
        }

        const dataset = await Dataset.findById(id);
        if (!dataset) {
            return res.status(404).json({ message: 'Dataset not found' });
        }

        // Cache result
        await redisClient.setex(`dataset:${id}`, 3600, JSON.stringify(dataset));

        res.json(dataset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
