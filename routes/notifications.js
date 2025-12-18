// routes/notifications.js
import express from 'express';
import {
  getUserTokens,
  sendTestNotification,
  getNotificationStatus,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/notifications/status - Check notification system status
router.get('/status', getNotificationStatus);

// GET /api/notifications/user/:userId/tokens - Get user's FCM tokens
router.get('/user/:userId/tokens', getUserTokens);

// POST /api/notifications/test - Send test notification
router.post('/test', sendTestNotification);

export default router;

