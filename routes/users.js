// routes/users.js
import express from 'express';
import {
    createUser,
    deleteUser,
    getActiveEmployees,
    getAllEmployeeActive,
    getAllUsers,
    getUserById,
    registerFCMToken,
    updateFCMToken,
    updateUser,
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

// POST /api/users/fcm-token/register - Register FCM token
router.post('/fcm-token/register', registerFCMToken);

// PUT /api/users/fcm-token/update - Update FCM token
router.put('/fcm-token/update', updateFCMToken);

// GET /api/users/:id
router.get('/:id', getUserById);

// POST /api/users
router.post('/', createUser);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

export default router;

