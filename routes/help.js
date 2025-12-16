// routes/help.js
import express from 'express';
import { sendHelpMessage } from '../controllers/helpController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/help/send - Send help/support message via email
router.post('/send', authenticateToken, sendHelpMessage);

export default router;
