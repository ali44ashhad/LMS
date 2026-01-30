import Lesson from '../models/Lesson.model.js';
import Module from '../models/Module.model.js';
import Course from '../models/Course.model.js';

export const verifyOwnership = async (req, res, next) => {
    try {
        let moduleId = req.body.moduleId;

        // If we have an existing lesson ID (update/delete), get module ID from it
        if (req.params.id) {
            const lesson = await Lesson.findById(req.params.id);
            if (!lesson) {
                return res.status(404).json({ success: false, message: 'Lesson not found' });
            }
            req.lesson = lesson; // Attach to request
            moduleId = lesson.module_id;
        }

        // Must have module ID by now
        if (!moduleId && !req.params.moduleId) {
            return next(); // Let specific route validations handle missing ID
        }

        const effectiveModuleId = moduleId || req.params.moduleId;
        const module = await Module.findById(effectiveModuleId);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const course = await Course.findByIdWithModules(module.course_id);

        if (course.instructor_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage lessons for your own courses'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createLesson = async (req, res) => {
    try {
        const { moduleId, title, description, videoUrl, duration, order, resources } = req.body;

        if (!moduleId || !title) {
            return res.status(400).json({ success: false, message: 'Module ID and title are required' });
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
