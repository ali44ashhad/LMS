import express from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import {
    getStats,
    getAllCourses,
    getCourseById,
    getInstructors,
    createCourse,
    updateCoursePublishStatus,
    updateCourse,
    deleteCourse,
    uploadFile,
    // Modules
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    // Lessons
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons
} from '../controllers/admin.controller.js';

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/stats
router.get('/stats', getStats);

// @route   GET /api/admin/courses
router.get('/courses', getAllCourses);

// @route   GET /api/admin/courses/:id
router.get('/courses/:id', getCourseById);

// @route   GET /api/admin/instructors - List available instructors (teachers/admins)
router.get('/instructors', getInstructors);

// @route   POST /api/admin/courses - Create course with instructor assignment
router.post('/courses', createCourse);

// @route   PATCH /api/admin/courses/:id/publish
router.patch('/courses/:id/publish', updateCoursePublishStatus);

// @route   PUT /api/admin/courses/:id
router.put('/courses/:id', updateCourse);

// @route   DELETE /api/admin/courses/:id
router.delete('/courses/:id', deleteCourse);

// @route   POST /api/admin/upload
router.post('/upload', upload.single('file'), uploadFile);

// ==========================================
// Admin Module Management Routes
// ==========================================

// @route   POST /api/admin/modules - Create module
router.post('/modules', createModule);

// @route   PUT /api/admin/modules/:id - Update module
router.put('/modules/:id', updateModule);

// @route   DELETE /api/admin/modules/:id - Delete module
router.delete('/modules/:id', deleteModule);

// @route   PUT /api/admin/modules/reorder/:courseId - Reorder modules
router.put('/modules/reorder/:courseId', reorderModules);

// ==========================================
// Admin Lesson Management Routes
// ==========================================

// @route   POST /api/admin/lessons - Create lesson
router.post('/lessons', createLesson);

// @route   PUT /api/admin/lessons/:id - Update lesson
router.put('/lessons/:id', updateLesson);

// @route   DELETE /api/admin/lessons/:id - Delete lesson
router.delete('/lessons/:id', deleteLesson);

// @route   PUT /api/admin/lessons/reorder/:moduleId - Reorder lessons
router.put('/lessons/reorder/:moduleId', reorderLessons);

export default router;
