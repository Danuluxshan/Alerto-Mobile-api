// routes/threats.js
import express from 'express';
import {
  getAllThreats,
  getThreatById,
  createThreat,
  updateThreat,
  deleteThreat,
} from '../controllers/threatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/threats
router.get('/', getAllThreats);

// GET /api/threats/:id
router.get('/:id', getThreatById);

// POST /api/threats
router.post('/', createThreat);

// PUT /api/threats/:id
router.put('/:id', updateThreat);

// DELETE /api/threats/:id
router.delete('/:id', deleteThreat);

export default router;

