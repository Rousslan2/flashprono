
import express from 'express';
import { getPublicStats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/api/stats/public', getPublicStats);

export default router;
