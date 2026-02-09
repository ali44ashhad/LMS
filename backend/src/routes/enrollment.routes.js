import express from 'express';
import { authenticateToken, requireStudent } from '../middlewares/auth.js';
import { enrollInCourse, getMyEnrollments, updateProgress } from '../controllers/enrollment.controller.js';

const router = express.Router();

// Protected: Enroll in course (students only)
router.post('/', authenticateToken, requireStudent, enrollInCourse);

// Protected: Get my enrollments
router.get('/my-enrollments', authenticateToken, getMyEnrollments);

// Protected: Update progress
router.patch('/:id/progress', authenticateToken, updateProgress);

export default router;
