import express from 'express';
import { generateInsights } from '../controllers/aiController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All AI routes require authentication
router.use(auth);

// Generate AI insights for dataset
router.post('/insights', generateInsights);

export default router;
