import express from 'express';
import Grade from '../models/Grade.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/grades/my
// @desc    Get my grades
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const { courseId } = req.query;
    let query = { student: req.user.id };

    if (courseId) query.course = courseId;

    const grades = await Grade.find(query)
      .populate('course', 'title')
      .populate('assignment', 'title')
      .populate('quiz', 'title')
      .sort('-gradedAt');

    res.json({ success: true, count: grades.length, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/grades/course/:courseId
// @desc    Get all grades for a course (Teacher/Admin)
// @access  Private/Teacher/Admin
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', 'name email')
      .populate('assignment', 'title')
      .populate('quiz', 'title')
      .sort('student -gradedAt');

    res.json({ success: true, count: grades.length, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
