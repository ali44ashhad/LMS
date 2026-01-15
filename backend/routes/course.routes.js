import express from 'express';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/my/enrolled
// @desc    Get enrolled courses for logged in user
// @access  Private
// NOTE: This route must come before /:id to avoid route conflicts
router.get('/my/enrolled', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course')
      .sort('-lastAccessed');

    const courses = enrollments.map(enrollment => ({
      ...enrollment.course._doc,
      progress: enrollment.progress,
      lastAccessed: enrollment.lastAccessed,
      enrolled: true
    }));

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    req.body.instructor = req.user.id;
    req.body.instructorName = req.user.name;
    
    // Debug: Log the incoming request - RAW data
    console.log('=== COURSE CREATION DEBUG (RAW) ===');
    console.log('Received lessons count:', req.body.lessons?.length);
    if (req.body.lessons && req.body.lessons.length > 0) {
      const firstLesson = req.body.lessons[0];
      console.log('First lesson resources (RAW):', JSON.stringify(firstLesson.resources));
      console.log('First lesson resources type:', typeof firstLesson.resources);
      console.log('First lesson resources isArray:', Array.isArray(firstLesson.resources));
      
      if (Array.isArray(firstLesson.resources) && firstLesson.resources.length > 0) {
        console.log('First resource element (RAW):', JSON.stringify(firstLesson.resources[0]));
        console.log('First resource element type:', typeof firstLesson.resources[0]);
        console.log('First resource element value:', firstLesson.resources[0]);
        
        // Check if first element is a string
        if (typeof firstLesson.resources[0] === 'string') {
          console.error('ERROR: First resource element is a STRING!');
          console.error('String value:', firstLesson.resources[0].substring(0, 500));
        }
      } else if (typeof firstLesson.resources === 'string') {
        console.log('WARNING: Resources is a string!', firstLesson.resources.substring(0, 200));
      }
    }
    console.log('=== END RAW DEBUG ===');
    
    // Clean and validate lessons resources - COMPLETELY REBUILD from scratch
    if (req.body.lessons && Array.isArray(req.body.lessons)) {
      req.body.lessons = req.body.lessons.map((lesson, lessonIndex) => {
        // Start with completely empty array
        const cleanResources = [];
        
        if (lesson.resources) {
          // If resources is a string, this is an error - log and skip
          if (typeof lesson.resources === 'string') {
            console.error(`Lesson ${lessonIndex}: Resources is a STRING! Attempting to parse...`);
            try {
              const parsed = JSON.parse(lesson.resources);
              lesson.resources = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.error(`Lesson ${lessonIndex}: Failed to parse resources string:`, e);
              lesson.resources = [];
            }
          }
          
          // Process as array - but rebuild completely
          if (Array.isArray(lesson.resources)) {
            lesson.resources.forEach((resource, resIndex) => {
              // CRITICAL: If resource element is a string, this is the problem!
              if (typeof resource === 'string') {
                console.error(`CRITICAL: Lesson ${lessonIndex}, Resource ${resIndex} is a STRING!`, resource.substring(0, 200));
                // Try to parse it
                try {
                  const parsed = JSON.parse(resource);
                  // If parsed is an array, extract objects from it
                  if (Array.isArray(parsed)) {
                    parsed.forEach((item, itemIdx) => {
                      if (item && typeof item === 'object' && !Array.isArray(item) && item.title && item.url) {
                        cleanResources.push({
                          title: String(item.title || '').trim(),
                          url: String(item.url || '').trim(),
                          type: String(item.type || 'pdf').trim()
                        });
                      }
                    });
                  } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.title && parsed.url) {
                    cleanResources.push({
                      title: String(parsed.title || '').trim(),
                      url: String(parsed.url || '').trim(),
                      type: String(parsed.type || 'pdf').trim()
                    });
                  }
                } catch (e) {
                  console.error(`Lesson ${lessonIndex}, Resource ${resIndex}: Failed to parse string:`, e);
                  // Skip this resource
                }
                return; // Don't process as object
              }
              
              // Skip arrays (unless we handle them above)
              if (Array.isArray(resource)) {
                console.warn(`Lesson ${lessonIndex}, Resource ${resIndex}: Resource is an array, extracting objects`);
                resource.forEach((item) => {
                  if (item && typeof item === 'object' && !Array.isArray(item) && item.title && item.url) {
                    cleanResources.push({
                      title: String(item.title || '').trim(),
                      url: String(item.url || '').trim(),
                      type: String(item.type || 'pdf').trim()
                    });
                  }
                });
                return;
              }
              
              // Only process if it's a plain object
              if (resource && typeof resource === 'object' && !Array.isArray(resource)) {
                // Must have title and url
                if (resource.title && resource.url) {
                  cleanResources.push({
                    title: String(resource.title || '').trim(),
                    url: String(resource.url || '').trim(),
                    type: String(resource.type || 'pdf').trim()
                  });
                } else {
                  console.warn(`Lesson ${lessonIndex}, Resource ${resIndex}: Missing title or url`);
                }
              } else {
                console.warn(`Lesson ${lessonIndex}, Resource ${resIndex}: Invalid resource type:`, typeof resource);
              }
            });
          }
        }
        
        // Final validation - ensure cleanResources is an array of objects
        const finalResources = cleanResources.filter(r => {
          const isValid = r && typeof r === 'object' && !Array.isArray(r) && r.title && r.url;
          if (!isValid) {
            console.error(`Lesson ${lessonIndex}: Filtering invalid resource:`, r);
          }
          return isValid;
        });
        
        return {
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: lesson.order,
          moduleId: lesson.moduleId,
          moduleName: lesson.moduleName,
          resources: finalResources // Always an array of objects
        };
      });
    }
    
    // Debug: Log after cleanup
    if (req.body.lessons && req.body.lessons.length > 0) {
      console.log('First lesson resources after cleanup:', req.body.lessons[0].resources);
      console.log('First lesson resources type:', typeof req.body.lessons[0].resources);
      console.log('First lesson resources isArray:', Array.isArray(req.body.lessons[0].resources));
      if (req.body.lessons[0].resources && req.body.lessons[0].resources.length > 0) {
        console.log('First resource element:', req.body.lessons[0].resources[0]);
        console.log('First resource element type:', typeof req.body.lessons[0].resources[0]);
        console.log('First resource element keys:', Object.keys(req.body.lessons[0].resources[0]));
      }
    }
    
    // CRITICAL: Ensure resources is always an array of objects before passing to Mongoose
    req.body.lessons = req.body.lessons.map(lesson => {
      // Deep clone to avoid any reference issues
      const cleanLesson = {
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        moduleId: lesson.moduleId,
        moduleName: lesson.moduleName,
        resources: [] // Start with empty array
      };
      
      // Rebuild resources array from scratch
      if (lesson.resources && Array.isArray(lesson.resources)) {
        lesson.resources.forEach((r) => {
          // Only add if it's a plain object
          if (r && typeof r === 'object' && !Array.isArray(r) && r.title && r.url) {
            cleanLesson.resources.push({
              title: String(r.title).trim(),
              url: String(r.url).trim(),
              type: String(r.type || 'pdf').trim()
            });
          }
        });
      }
      
      return cleanLesson;
    });
    
    // Final check before Mongoose
    console.log('=== BEFORE MONGOOSE CREATE ===');
    if (req.body.lessons && req.body.lessons.length > 0) {
      console.log('Final first lesson resources:', JSON.stringify(req.body.lessons[0].resources));
      console.log('Final first resource type:', typeof req.body.lessons[0].resources[0]);
    }
    
    const course = await Course.create(req.body);

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Course creation error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
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

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
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

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
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

    await course.deleteOne();

    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
