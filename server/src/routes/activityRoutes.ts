import express from 'express';
import { authToken, authAdmin } from '../middleware/auth.js';
import { getLogs, createLog } from '../controllers/activityController.js';

const router = express.Router();

router.get('/', authToken, authAdmin, getLogs);
router.post('/', authToken, createLog);

export default router;
