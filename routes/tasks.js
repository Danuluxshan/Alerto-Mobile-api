// routes/tasks.js
import express from 'express';
import {
    createTask,
    deleteTask,
    getAlertHistory,
    getAllTasks,
    getTaskById,
    getTasksByUserId,
    updateTask,
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/tasks
router.get('/', getAllTasks);

// GET /api/tasks/user/:userId
router.get('/user/:userId', getTasksByUserId);

// GET /api/tasks/history/:userId
router.get('/history/:userId', getAlertHistory);

// GET /api/tasks/:id
router.get('/:id', getTaskById);

// POST /api/tasks
router.post('/', createTask);

// PUT /api/tasks/:id
router.put('/:id', updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

export default router;

