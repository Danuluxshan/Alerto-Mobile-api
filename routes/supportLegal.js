// routes/supportLegal.js
import express from 'express';
import { createOrUpdateContent, getContentByType } from '../controllers/supportLegalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/support-legal/:type - Get content by type
router.get('/:type', authenticateToken, getContentByType);

// POST /api/support-legal - Create or update content
router.post('/', authenticateToken, createOrUpdateContent);

export default router;