import Module from '../models/Module.model.js';
import Course from '../models/Course.model.js';

export const verifyCourseOwnership = async (req, res, next) => {
    try {
        const courseId = req.body.courseId || req.params.courseId;
        if (!courseId) return next(); // Skip if no courseId (might be in parent route)

        const course = await Course.findByIdWithModules(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.instructor_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage modules for your own courses'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createModule = async (req, res) => {
    try {
        const { courseId, title, description, order } = req.body;

        if (!courseId || !title) {
            return res.status(400).json({ success: false, message: 'Current ID and title are required' });
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

        // Verify ownership via course
        const course = await Course.findByIdWithModules(module.course_id);
        if (course.instructor_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
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

        const course = await Course.findByIdWithModules(module.course_id);
        if (course.instructor_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
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

        // Verify ownership
        const course = await Course.findByIdWithModules(req.params.courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (course.instructor_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const updatedModules = await Module.reorder(req.params.courseId, modules);
        res.json({ success: true, modules: updatedModules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
