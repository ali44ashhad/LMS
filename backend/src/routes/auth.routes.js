import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateToken, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Validate token endpoint (for SSO)
router.get('/validate', authenticateToken, validateToken);

// Logout (just for frontend to clear tokens)
router.post('/logout', logout);

export default router;
