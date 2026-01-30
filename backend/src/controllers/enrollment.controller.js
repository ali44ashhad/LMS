import Enrollment from '../models/Enrollment.model.js';

export const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const enrollment = await Enrollment.create(req.userId, courseId);
        res.status(201).json({ success: true, enrollment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.findByStudent(req.userId);
        res.json({ success: true, enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProgress = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const enrollment = await Enrollment.updateProgress(req.params.id, lessonId);

        // Recalculate overall progress
        // let progress = 0; // Removing unused variable warning if unrelated
        if (enrollment) {
            const progress = await Enrollment.calculateProgress(req.params.id, enrollment.course_id);
            enrollment.progress = progress;
        }
        // const updatedEnrollment = { ...enrollment, progress };
        res.json({ success: true, enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
