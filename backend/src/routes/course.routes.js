import express from 'express';
import { authenticateToken, requireInstructor, optionalAuth } from '../middlewares/auth.js';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getInstructorCourses
} from '../controllers/course.controller.js';

const router = express.Router();

// Public: Get all published courses
router.get('/', optionalAuth, getAllCourses);

// Public: Get course by ID
router.get('/:id', optionalAuth, getCourseById);

// Protected: Create course (instructor only)
router.post('/', authenticateToken, requireInstructor, createCourse);

// Protected: Update course (instructor only, own courses)
router.put('/:id', authenticateToken, requireInstructor, updateCourse);

// Protected: Delete course (instructor only, own courses)
router.delete('/:id', authenticateToken, requireInstructor, deleteCourse);

// Protected: Get instructor's courses
router.get('/instructor/my-courses', authenticateToken, requireInstructor, getInstructorCourses);

export default router;
