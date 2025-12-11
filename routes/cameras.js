// routes/cameras.js
import express from 'express';
import {
  getAllCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCamera,
} from '../controllers/cameraController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/cameras
router.get('/', getAllCameras);

// GET /api/cameras/:id
router.get('/:id', getCameraById);

// POST /api/cameras
router.post('/', createCamera);

// PUT /api/cameras/:id
router.put('/:id', updateCamera);

// DELETE /api/cameras/:id
router.delete('/:id', deleteCamera);

export default router;

