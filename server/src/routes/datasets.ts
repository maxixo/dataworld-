import express from 'express';
import { uploadDataset, getDatasets, getDatasetById } from '../controllers/datasetController';
import { auth } from '../middleware/auth'; // We need to create this middleware

const router = express.Router();

router.post('/', auth, uploadDataset);
router.get('/', auth, getDatasets);
router.get('/:id', auth, getDatasetById);

export default router;
