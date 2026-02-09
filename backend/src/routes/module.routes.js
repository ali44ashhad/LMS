import express from 'express';
import { authenticateToken, requireInstructor } from '../middlewares/auth.js';
import {
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    verifyCourseOwnership
} from '../controllers/module.controller.js';

const router = express.Router();

// POST: Create a new module
router.post('/', authenticateToken, requireInstructor, verifyCourseOwnership, createModule);

// PUT: Update a module
router.put('/:id', authenticateToken, requireInstructor, updateModule);

// DELETE: Delete a module
router.delete('/:id', authenticateToken, requireInstructor, deleteModule);

// PUT: Reorder modules
router.put('/reorder/:courseId', authenticateToken, requireInstructor, reorderModules);

export default router;
