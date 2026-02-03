import Course from '../models/Course.model.js';

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findPublished();
        res.json({ success: true, courses });
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

export const createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            instructor_id: req.userId,
            instructor_name: req.body.instructorName || 'Instructor'
        };

        const course = await Course.create(courseData);
        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdWithModules(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Verify ownership
        if (course.instructor_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own courses'
            });
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

        // Verify ownership
        if (course.instructor_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own courses'
            });
        }

        await Course.delete(req.params.id);
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInstructorCourses = async (req, res) => {
    try {
        const courses = await Course.findByInstructor(req.userId);
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
