// routes/users.js
import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getActiveEmployees,
  getAllEmployeeActive,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users
router.get('/', getAllUsers);

// GET /api/users/active
router.get('/active', getActiveEmployees);

// GET /api/users/active/all - Get all employee active records (for status checking)
router.get('/active/all', getAllEmployeeActive);

// GET /api/users/:id
router.get('/:id', getUserById);

// POST /api/users
router.post('/', createUser);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

export default router;

