// routes/contact.js
import express from 'express';
import { createOrUpdateContact, getContact } from '../controllers/contactController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/contact - Get contact information
router.get('/', authenticateToken, getContact);

// POST /api/contact - Create or update contact information
router.post('/', authenticateToken, createOrUpdateContact);

export default router;

