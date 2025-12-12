// routes/employeeActive.js
import express from 'express';
import {
  createActiveRecord,
  updateToInactive,
  getCurrentStatus,
} from '../controllers/employeeActiveController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/employee-active - Create a new active record
router.post('/', createActiveRecord);

// PUT /api/employee-active/:userId/inactive - Update to inactive
router.put('/:userId/inactive', updateToInactive);

// GET /api/employee-active/:userId/status - Get current status
router.get('/:userId/status', getCurrentStatus);

export default router;

