import express from 'express';
import { uploadDataset, getDatasets, getDatasetBlob, getUploadHistory, getDatasetById } from '../controllers/datasetController';
import { auth } from '../middleware/auth'; // We need to create this middleware

const router = express.Router();

router.post('/', auth, uploadDataset);
router.get('/', auth, getDatasets);
router.get('/history', auth, getUploadHistory);
router.get('/:id', auth, getDatasetById);
router.get('/:id/blob', auth, getDatasetBlob);

export default router;
