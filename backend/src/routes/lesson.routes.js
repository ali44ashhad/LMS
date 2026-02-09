import express from 'express';
import { authenticateToken, requireInstructor } from '../middlewares/auth.js';
import {
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    verifyOwnership
} from '../controllers/lesson.controller.js';

const router = express.Router();

// POST: Create a new lesson
router.post('/', authenticateToken, requireInstructor, verifyOwnership, createLesson);

// PUT: Update a lesson
router.put('/:id', authenticateToken, requireInstructor, verifyOwnership, updateLesson);

// DELETE: Delete a lesson
router.delete('/:id', authenticateToken, requireInstructor, verifyOwnership, deleteLesson);

// PUT: Reorder lessons
router.put('/reorder/:moduleId', authenticateToken, requireInstructor, verifyOwnership, reorderLessons);

export default router;
