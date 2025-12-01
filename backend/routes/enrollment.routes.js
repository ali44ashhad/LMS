import express from 'express';
import Enrollment from '../models/Enrollment.model.js';
import Course from '../models/Course.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId
    });

    // Update course enrolled students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 }
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/enrollments/my
// @desc    Get my enrollments
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course')
      .sort('-lastAccessed');

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/enrollments/:id/progress
// @desc    Update course progress
// @access  Private
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const { progress, completedLessons } = req.body;

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      student: req.user.id
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (progress !== undefined) enrollment.progress = progress;
    if (completedLessons) enrollment.completedLessons = completedLessons;
    enrollment.lastAccessed = Date.now();

    if (progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = Date.now();
    }

    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
