import Course from '../models/Course.model.js';
import Module from '../models/Module.model.js';
import Lesson from '../models/Lesson.model.js';
import cloudinary from '../config/cloudinary.js';
import { query, table } from '../utils/db.js';

// Get all instructors (teachers and admins) for course assignment
export const getInstructors = async (req, res) => {
    try {
        const result = await query(
            `SELECT id, name, email, role, roles
             FROM ${table('users')}
             WHERE roles && ARRAY['teacher', 'admin']::TEXT[]
             ORDER BY name ASC`
        );

        const instructors = result.rows.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            roles: user.roles
        }));

        res.json({
            success: true,
            instructors,
            total: instructors.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create course with instructor assignment (admin only)
export const createCourse = async (req, res) => {
    try {
        const { instructorId, instructorName, ...courseData } = req.body;

        // Validate instructorId is provided
        if (!instructorId) {
            return res.status(400).json({
                success: false,
                message: 'instructorId is required'
            });
        }

        // Validate instructorName is provided
        if (!instructorName) {
            return res.status(400).json({
                success: false,
                message: 'instructorName is required'
            });
        }

        // Validate that the instructor exists and has proper role (teacher or admin)
        const instructorResult = await query(
            `SELECT id, name, role, roles
             FROM ${table('users')}
             WHERE id = $1`,
            [instructorId]
        );

        if (instructorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        const instructor = instructorResult.rows[0];
        const hasInstructorRole = instructor.roles &&
            (instructor.roles.includes('teacher') || instructor.roles.includes('admin'));

        if (!hasInstructorRole) {
            return res.status(400).json({
                success: false,
                message: 'Selected user does not have teacher or admin role'
            });
        }

        // Create the course with the specified instructor
        const course = await Course.create({
            ...courseData,
            instructor_id: instructorId,
            instructor_name: instructorName
        });

        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        // TODO: Implement PG stats queries
        // For now returning basic course stats
        const courses = await Course.findAll();
        const publishedCourses = courses.filter(c => c.is_published).length;

        res.json({
            success: true,
            stats: {
                totalUsers: 0, // Pending User model update
                totalStudents: 0,
                totalCourses: courses.length,
                publishedCourses,
                totalEnrollments: 0, // Pending Enrollment model update
                recentEnrollments: 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        // Course.findAll() returns all courses
        const courses = await Course.findAll();

        res.json({
            success: true,
            courses,
            total: courses.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findByIdWithModules(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCoursePublishStatus = async (req, res) => {
    try {
        const { isPublished } = req.body;
        const course = await Course.update(req.params.id, { is_published: isPublished });
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        // Validate course ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            // PG IDs might be different (UUID or Serial), but keeping regex check if IDs are Mongo-like strings
            // If IDs are integers, this check should be removed/updated
        }

        // Check if course exists
        // Course.findByIdWithLessons checks ID internally
        const course = await Course.findByIdWithModules(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const updated = await Course.update(req.params.id, req.body);
        res.json({ success: true, course: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdWithModules(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        await Course.delete(req.params.id);
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Check Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary credentials missing!');
            return res.status(500).json({
                success: false,
                message: 'Cloudinary configuration is missing. Please check your .env file.'
            });
        }

        // Convert buffer to base64 string for Cloudinary
        const base64File = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64File}`;
        const originalName = req.file.originalname;

        // Ensure filename ends with .pdf
        const filenameWithExt = originalName.toLowerCase().endsWith('.pdf')
            ? originalName
            : `${originalName}.pdf`;

        // Sanitize filename for Cloudinary
        const baseName = filenameWithExt.replace(/\.pdf$/i, '');
        const sanitizedName = baseName
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const timestamp = Date.now();
        const publicId = `${sanitizedName}-${timestamp}`;

        // Upload PDF to Cloudinary as raw file
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'raw',
            folder: 'lms/course-resources',
            public_id: publicId,
            overwrite: false,
            use_filename: false,
            format: 'pdf'
        });

        let fileUrl = uploadResult.secure_url;

        if (!fileUrl.toLowerCase().endsWith('.pdf')) {
            fileUrl = `${fileUrl}.pdf`;
        }

        if (fileUrl.includes('?')) {
            fileUrl = fileUrl.split('?')[0];
        }

        res.json({
            success: true,
            file: {
                filename: req.file.originalname,
                originalname: req.file.originalname,
                url: fileUrl,
                public_id: uploadResult.public_id,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload file to Cloudinary'
        });
    }
};

// ==========================================
// Admin Module Management (Bypasses ownership)
// ==========================================

export const createModule = async (req, res) => {
    try {
        const { courseId, title, description, order } = req.body;

        if (!courseId || !title) {
            return res.status(400).json({ success: false, message: 'Course ID and title are required' });
        }

        // Validate course exists (but don't check ownership)
        const course = await Course.findByIdWithModules(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = await Module.create({
            course_id: courseId,
            title,
            description,
            order_num: order
        });

        res.status(201).json({ success: true, module });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const updatedModule = await Module.update(req.params.id, req.body);
        res.json({ success: true, module: updatedModule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        await Module.delete(req.params.id);
        res.json({ success: true, message: 'Module deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reorderModules = async (req, res) => {
    try {
        const { modules } = req.body; // Array of { id, order }

        // Validate course exists
        const course = await Course.findByIdWithModules(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const updatedModules = await Module.reorder(req.params.courseId, modules);
        res.json({ success: true, modules: updatedModules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Admin Lesson Management (Bypasses ownership)
// ==========================================

export const createLesson = async (req, res) => {
    try {
        const { moduleId, title, description, videoUrl, duration, order, resources } = req.body;

        if (!moduleId || !title) {
            return res.status(400).json({ success: false, message: 'Module ID and title are required' });
        }

        // Validate module exists
        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const lesson = await Lesson.create({
            module_id: moduleId,
            title,
            description,
            video_url: videoUrl,
            duration,
            order_num: order,
            resources
        });

        res.status(201).json({ success: true, lesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLesson = async (req, res) => {
    try {
        const { title, description, videoUrl, duration, resources } = req.body;

        const updatedLesson = await Lesson.update(req.params.id, {
            title,
            description,
            video_url: videoUrl,
            duration,
            resources
        });

        if (!updatedLesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        res.json({ success: true, lesson: updatedLesson });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteLesson = async (req, res) => {
    try {
        await Lesson.delete(req.params.id);
        res.json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reorderLessons = async (req, res) => {
    try {
        const { lessons } = req.body; // Array of { id, order }

        const updatedLessons = await Lesson.reorder(req.params.moduleId, lessons);
        res.json({ success: true, lessons: updatedLessons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
