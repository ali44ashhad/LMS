import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Check if Assignment and Quiz models exist, if not just skip them
let Assignment = null;
let Quiz = null;
try {
  Assignment = (await import('../models/Assignment.model.js')).default;
} catch (e) {
  // Assignment model not found - skip silently
}
try {
  Quiz = (await import('../models/Quiz.model.js')).default;
} catch (e) {
  // Quiz model not found - skip silently
}

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments();

    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        recentEnrollments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (activate/deactivate, change role)
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    // Validate user ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const { isActive, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    // Validate user ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/courses
// @desc    Get all courses (including unpublished)
// @access  Private/Admin
router.get('/courses', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const courses = await Course.find()
      .populate('instructor', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Course.countDocuments();

    res.json({
      success: true,
      courses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update course
// @access  Private/Admin
router.put('/courses/:id', async (req, res) => {
  try {
    // Validate course ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course
// @access  Private/Admin
router.delete('/courses/:id', async (req, res) => {
  try {
    // Validate course ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete related data
    await Enrollment.deleteMany({ course: req.params.id });
    
    // Only delete if models exist
    if (Assignment) {
      await Assignment.deleteMany({ course: req.params.id });
    }
    if (Quiz) {
      await Quiz.deleteMany({ course: req.params.id });
    }

    await course.deleteOne();

    res.json({ success: true, message: 'Course and related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/enrollments
// @desc    Get all enrollments
// @access  Private/Admin
router.get('/enrollments', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const enrollments = await Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Enrollment.countDocuments();

    res.json({
      success: true,
      enrollments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/upload
// @desc    Upload course file (PDF) to Cloudinary
// @access  Private/Admin
router.post('/upload', upload.single('file'), async (req, res) => {
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

    console.log('Uploading file to Cloudinary:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bufferLength: req.file.buffer?.length
    });

    // Convert buffer to base64 string for Cloudinary
    const base64File = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

    // Preserve original filename for display, but sanitize for Cloudinary
    const originalName = req.file.originalname;
    
    // Ensure filename ends with .pdf
    const filenameWithExt = originalName.toLowerCase().endsWith('.pdf') 
      ? originalName 
      : `${originalName}.pdf`;
    
    // Sanitize filename for Cloudinary: replace spaces with hyphens, remove special chars
    const baseName = filenameWithExt.replace(/\.pdf$/i, '');
    const sanitizedName = baseName
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const timestamp = Date.now();
    
    // Use sanitized filename with timestamp for public_id
    const publicId = `${sanitizedName}-${timestamp}`;
    
    // Upload to Cloudinary
    console.log('Uploading file to Cloudinary:', {
      originalname: originalName,
      sanitized_name: sanitizedName,
      public_id: publicId,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Upload PDF to Cloudinary as raw file
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw', // For PDF files
      folder: 'lms/course-resources', // Organize files in Cloudinary
      public_id: publicId, // Sanitized filename with timestamp
      overwrite: false,
      use_filename: false,
      format: 'pdf' // Explicitly set format
    });

    console.log('Cloudinary upload successful:', {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      version: uploadResult.version
    });

    // Use Cloudinary's secure_url directly - it has the correct sanitized path
    // This URL will have hyphens instead of spaces (%20)
    let fileUrl = uploadResult.secure_url;
    
    // Ensure URL ends with .pdf extension for proper browser handling
    if (!fileUrl.toLowerCase().endsWith('.pdf')) {
      fileUrl = `${fileUrl}.pdf`;
    }
    
    // Remove query parameters for clean URL
    if (fileUrl.includes('?')) {
      fileUrl = fileUrl.split('?')[0];
    }
    
    res.json({
      success: true,
      file: {
        filename: req.file.originalname,
        originalname: req.file.originalname,
        url: fileUrl, // Use secure_url for HTTPS
        public_id: uploadResult.public_id,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error details:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file to Cloudinary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
