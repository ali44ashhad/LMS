import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getProfile, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

// Protected: Get current user profile
router.get('/profile', authenticateToken, getProfile);

// Protected: Update LMS profile
router.put('/profile', authenticateToken, updateProfile);

export default router;
