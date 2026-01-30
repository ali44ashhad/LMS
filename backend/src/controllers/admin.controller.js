import Course from '../models/Course.model.js';
import cloudinary from '../config/cloudinary.js';

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
