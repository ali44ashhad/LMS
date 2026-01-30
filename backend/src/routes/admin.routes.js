import express from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import {
    getStats,
    getAllCourses,
    updateCoursePublishStatus,
    updateCourse,
    deleteCourse,
    uploadFile
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

// @route   PATCH /api/admin/courses/:id/publish
router.patch('/courses/:id/publish', updateCoursePublishStatus);

// @route   PUT /api/admin/courses/:id
router.put('/courses/:id', updateCourse);

// @route   DELETE /api/admin/courses/:id
router.delete('/courses/:id', deleteCourse);

// @route   POST /api/admin/upload
router.post('/upload', upload.single('file'), uploadFile);

export default router;
