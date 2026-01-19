import React, { useState, useEffect, useRef } from 'react';
import { courseAPI, adminAPI } from '../services/api';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const AdminCourseCreate = ({ course, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'Development',
    level: 'Beginner',
    duration: '',
    image: '📚',
    isPublished: false,
    modules: []
  });

  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    videos: [],
    files: [],
    quiz: null,
    assignment: null
  });

  const [currentVideo, setCurrentVideo] = useState({
    title: '',
    url: '',
    duration: '',
    description: ''
  });
  const [editingVideoId, setEditingVideoId] = useState(null);
  // Track which video is being edited in modules (format: "moduleId-videoId")
  const [editingVideoInModule, setEditingVideoInModule] = useState(null);
  const [editingVideoData, setEditingVideoData] = useState({});
  const [videoDescEditing, setVideoDescEditing] = useState(null);
  const videoQuillRefs = useRef({});
  const videoQuillInstances = useRef({});
  const videoQuillChangeRef = useRef({});
  const videoQuillInitializingRef = useRef({});
  const videoEditorRef = useRef(null);
  const moduleEditorRef = useRef(null);
  // Refs for inline video editors in modules
  const inlineVideoEditorRefs = useRef({});

  const [currentFile, setCurrentFile] = useState({
    title: '',
    url: '',
    type: 'pdf',
    file: null
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  const [editingModuleId, setEditingModuleId] = useState(null);
  const isEditMode = !!(course && course._id);
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const isQuillChangeRef = useRef(false);
  const isInitializingRef = useRef(false);

  // Group lessons by moduleId to recreate module structure
  const groupLessonsByModule = (lessons) => {
    const moduleMap = new Map();
    
    lessons.forEach((lesson, idx) => {
      const moduleId = lesson.moduleId || 'default-module-0';
      const moduleName = lesson.moduleName || 'Module 1';
      
      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          id: moduleId || (Date.now() + Math.random()),
          title: moduleName,
          description: '', // Module description, not lesson description
          videos: [],
          files: [], // Module-level files/resources
          quiz: null,
          assignment: null
        });
      }
      
      const module = moduleMap.get(moduleId);
      
      // Check if this is a module resource lesson (no videoUrl and isModuleResource flag)
      const isModuleResourceLesson = lesson.isModuleResource || 
                                    (!lesson.videoUrl && lesson.title && lesson.title.includes('Resources'));
      
      if (isModuleResourceLesson) {
        // This is a module resource lesson - add resources to module.files
        if (lesson.resources) {
          let resourcesArray = [];
          
          // Handle if resources is a string
          if (typeof lesson.resources === 'string') {
            try {
              resourcesArray = JSON.parse(lesson.resources);
            } catch (e) {
              console.warn('Failed to parse resources string:', e);
              resourcesArray = [];
            }
          } else if (Array.isArray(lesson.resources)) {
            resourcesArray = lesson.resources;
          }
          
          resourcesArray.forEach((resource) => {
            // Only add if resource is a valid object
            if (resource && typeof resource === 'object' && resource.title && resource.url) {
              module.files.push({
                title: String(resource.title || ''),
                url: String(resource.url || ''),
                type: String(resource.type || 'pdf'),
                id: resource._id || resource.id || (Date.now() + Math.random())
              });
            }
          });
        }
      } else if (lesson.videoUrl) {
        // This is a regular video lesson - add video to module
        module.videos.push({
          id: lesson._id || (Date.now() + Math.random()),
          title: lesson.title || '',
          url: lesson.videoUrl,
          duration: lesson.duration || '',
          description: lesson.description || ''
        });
      }
      // Note: We no longer add lesson.resources to module.files for regular video lessons
      // Only module resource lessons contribute to module.files
    });
    
    return Array.from(moduleMap.values());
  };

  useEffect(() => {
    if (course) {
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'Development',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        image: course.image || '📚',
        isPublished: course.isPublished || false,
        modules: course.lessons ? groupLessonsByModule(course.lessons) : []
      });
    }
  }, [course]);

  const addVideo = () => {
    if (currentVideo.title && currentVideo.url) {
      if (editingVideoId !== null) {
        // Update existing video
        setCurrentModule((prev) => ({
          ...prev,
          videos: prev.videos.map((v) =>
            v.id === editingVideoId ? { ...currentVideo, id: editingVideoId } : v
          )
        }));
        setEditingVideoId(null);
      } else {
        // Add new video
      setCurrentModule((prev) => ({
        ...prev,
        videos: [...prev.videos, { ...currentVideo, id: Date.now() }]
      }));
      }
      setCurrentVideo({ title: '', url: '', duration: '', description: '' });
    }
  };

  const editVideo = (video) => {
    // Ensure we have all video properties including description
    const videoWithDescription = {
      title: video.title || '',
      url: video.url || '',
      duration: video.duration || '',
      description: video.description || ''
    };
    
    // Reset any stuck Quill state before editing
    videoQuillChangeRef.current['video-desc'] = false;
    
    // Set the video data and editing ID
    setCurrentVideo(videoWithDescription);
    setEditingVideoId(video.id);
    
    // Scrolling is handled by useEffect when editingVideoId changes
  };

  // Edit video directly in modules array (for inline editing)
  const editVideoInModule = (moduleId, video) => {
    const videoKey = `${moduleId}-${video.id}`;
    const videoWithDescription = {
      title: video.title || '',
      url: video.url || '',
      duration: video.duration || '',
      description: video.description || ''
    };
    
    // Reset any stuck Quill state before editing
    videoQuillChangeRef.current[videoKey] = false;
    
    // Set the video data and editing key
    setEditingVideoInModule(videoKey);
    setEditingVideoData(videoWithDescription);
  };

  // Save video edited in modules array
  const saveVideoInModule = (moduleId, videoId) => {
    const module = courseData.modules.find(m => m.id === moduleId);
    if (!module) return;

    if (editingVideoData.title && editingVideoData.url) {
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                videos: m.videos.map((v) =>
                  v.id === videoId ? { ...editingVideoData, id: videoId } : v
                )
              }
            : m
        )
      }));
      
      // Cleanup Quill instance
      const videoKey = `${moduleId}-${videoId}`;
      if (videoQuillInstances.current[videoKey]) {
        try {
          videoQuillInstances.current[videoKey].off('text-change');
        } catch (e) {
          console.error('Error removing event listeners:', e);
        }
        videoQuillInstances.current[videoKey] = null;
      }
      
      setEditingVideoInModule(null);
      setEditingVideoData({});
    }
  };

  // Cancel editing video in modules array
  const cancelEditVideoInModule = (moduleId, videoId) => {
    const videoKey = `${moduleId}-${videoId}`;
    
    // Cleanup Quill instance
    if (videoQuillInstances.current[videoKey]) {
      try {
        videoQuillInstances.current[videoKey].off('text-change');
      } catch (e) {
        console.error('Error removing event listeners:', e);
      }
      videoQuillInstances.current[videoKey] = null;
    }
    
    // Clean up DOM elements
    const container = videoQuillRefs.current[videoKey];
    if (container) {
      const parentContainer = container?.parentElement;
      if (parentContainer) {
        const toolbar = parentContainer.querySelector('.ql-toolbar');
        if (toolbar) toolbar.remove();
        const qlContainer = parentContainer.querySelector('.ql-container');
        if (qlContainer) qlContainer.remove();
      }
      container.innerHTML = '';
    }
    
    setEditingVideoInModule(null);
    setEditingVideoData({});
  };

  const cancelEditVideo = () => {
    setCurrentVideo({ title: '', url: '', duration: '', description: '' });
    setEditingVideoId(null);
  };

  // Remove video from modules array
  const removeVideoFromModule = (moduleId, videoId) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              videos: m.videos.filter((v) => v.id !== videoId)
            }
          : m
      )
    }));
  };

  const removeVideo = (videoId) => {
    setCurrentModule((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v.id !== videoId)
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      console.log('Starting file upload...');
      const response = await adminAPI.uploadFile(file);
      
      console.log('Upload response:', response);
      
      if (response.success && response.file) {
        // Cloudinary returns a full URL (secure_url)
        const fileUrl = response.file.url;
        
        // Verify it's a valid Cloudinary URL or HTTP(S) URL
        if (!fileUrl || fileUrl.startsWith('file://')) {
          console.error('Invalid file URL returned:', fileUrl);
          alert('File upload failed: Invalid URL returned. Please check your Cloudinary configuration.');
          setUploadingFile(false);
          return;
        }
        
        console.log('File uploaded successfully:', fileUrl);
        
        setCurrentFile({
          title: file.name.replace('.pdf', ''),
          url: fileUrl,
          type: 'pdf',
          file: file
        });
      } else {
        alert('Failed to upload file. Please try again.');
        console.error('Upload failed:', response);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingFile(false);
    }
  };

  const addFile = () => {
    if (currentFile.title && currentFile.url) {
      // Create a clean file object without any extra properties
      const cleanFile = {
        title: String(currentFile.title).trim(),
        url: String(currentFile.url).trim(),
        type: String(currentFile.type || 'pdf').trim(),
        id: Date.now()
      };
      
      setCurrentModule((prev) => ({
        ...prev,
        files: [...prev.files, cleanFile]
      }));
      setCurrentFile({ title: '', url: '', type: 'pdf', file: null });
      // Reset file input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
    } else {
      alert('Please upload a PDF file first');
    }
  };

  const removeFile = (fileId) => {
    setCurrentModule((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId)
    }));
  };

  const addModule = () => {
    if (currentModule.title) {
      if (editingModuleId) {
        // Update existing module
        setCourseData((prev) => ({
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === editingModuleId ? { ...currentModule, id: m.id } : m
          )
        }));
        setEditingModuleId(null);
        alert('Module updated successfully!');
      } else {
        // Add new module
        setCourseData((prev) => ({
          ...prev,
          modules: [...prev.modules, { ...currentModule, id: Date.now() }]
        }));
      }
      setCurrentModule({
        title: '',
        description: '',
        videos: [],
        files: [],
        quiz: null,
        assignment: null
      });
    }
  };

  // Edit module
  const editModule = (moduleId) => {
    const moduleToEdit = courseData.modules.find(m => m.id === moduleId);
    if (moduleToEdit) {
      setCurrentModule(JSON.parse(JSON.stringify(moduleToEdit)));
      setEditingModuleId(moduleId);
      // Scrolling is handled by useEffect when editingModuleId changes
    }
  };

  const removeModule = (moduleId) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // DEBUG: Log the initial state
      console.log('=== INITIAL STATE DEBUG ===');
      console.log('CourseData modules:', courseData.modules);
      courseData.modules.forEach((module, idx) => {
        console.log(`Module ${idx} files:`, module.files);
        console.log(`Module ${idx} files type:`, typeof module.files);
        console.log(`Module ${idx} files isArray:`, Array.isArray(module.files));
        if (module.files && module.files.length > 0) {
          console.log(`Module ${idx} first file:`, module.files[0]);
          console.log(`Module ${idx} first file type:`, typeof module.files[0]);
        }
      });
      console.log('=== END INITIAL STATE DEBUG ===');

      const lessons = courseData.modules.flatMap((module, moduleIndex) => {
        // Ensure module.files is an array (for module-level resources)
        let moduleFiles = [];
        if (module && module.files) {
          if (Array.isArray(module.files)) {
            moduleFiles = module.files;
          } else if (typeof module.files === 'string') {
            try {
              const parsed = JSON.parse(module.files);
              moduleFiles = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.warn('Failed to parse module.files string:', e);
              moduleFiles = [];
            }
          }
        }
        
        // Ensure module.videos is an array
        const moduleVideos = Array.isArray(module.videos) ? module.videos : [];
        const moduleId = String(`module-${moduleIndex}`);
        const moduleName = String(module.title || `Module ${moduleIndex + 1}`);
        
        const lessonList = [];
        
        // Create lessons for videos (without module files attached)
        moduleVideos.forEach((video, videoIndex) => {
          // Videos should have empty resources - module files are separate
          const lesson = {
            title: String(video.title || ''),
            description: String(video.description || ''),
            videoUrl: String(video.url || ''),
            duration: String(video.duration || ''),
            order: Number(moduleIndex * 1000 + videoIndex * 10), // Use larger multiplier for ordering
            moduleId: moduleId,
            moduleName: moduleName,
            resources: [] // Videos have no resources - module files are separate
          };
          
          lessonList.push(lesson);
        });
        
        // Create a special lesson entry for module-level resources (placed after all videos)
        if (Array.isArray(moduleFiles) && moduleFiles.length > 0) {
          // Build module resources array
          const moduleResources = [];
          
          moduleFiles.forEach((file, fileIndex) => {
            try {
              // Skip invalid entries
              if (!file || typeof file !== 'object' || Array.isArray(file)) {
                return;
              }
              
              // Extract values directly
              const fileTitle = file.title;
              const fileUrl = file.url;
              const fileType = file.type;
              
              // Validate that title and url are strings
              if (!fileTitle || !fileUrl || typeof fileTitle !== 'string' || typeof fileUrl !== 'string') {
                console.warn(`Module ${moduleIndex}, File ${fileIndex}: Invalid file data`);
                return;
              }
              
              // Create a completely new object with only the required fields
              const newResource = {
                title: fileTitle.trim(),
                url: fileUrl.trim(),
                type: (fileType && typeof fileType === 'string') ? fileType.trim() : 'pdf'
              };
              
              // Final validation before pushing
              if (typeof newResource.title === 'string' && typeof newResource.url === 'string' && typeof newResource.type === 'string') {
                moduleResources.push(newResource);
              }
            } catch (error) {
              console.error(`Module ${moduleIndex}, File ${fileIndex}: Error processing file`, error);
            }
          });
          
          // Create a special lesson entry for module resources (no videoUrl, just resources)
          // This will be identified as module-level resources when grouping lessons
          if (moduleResources.length > 0) {
            const moduleResourceLesson = {
              title: String(`${moduleName} - Resources`), // Special title to identify as module resources
              description: String('Module Resources'), // Special description
              videoUrl: String(''), // No video URL - this is a resource-only entry
              duration: String(''),
              order: Number(moduleIndex * 1000 + moduleVideos.length * 10 + 1), // Place after all videos
              moduleId: moduleId,
              moduleName: moduleName,
              resources: moduleResources, // Module-level resources
              isModuleResource: true // Flag to identify this as module resources
            };
            
            lessonList.push(moduleResourceLesson);
          }
        }
        
        return lessonList;
      });

      // Single pass validation - ensure all lessons have properly formatted resources
      const validatedLessons = lessons.map(lesson => {
        // Process resources - ensure it's always an array of objects
        let safeResources = [];
        
        if (lesson.resources) {
          // Handle if resources is accidentally a string
          if (typeof lesson.resources === 'string') {
            try {
              const parsed = JSON.parse(lesson.resources);
              lesson.resources = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              lesson.resources = [];
            }
          }
          
          // Process as array
          if (Array.isArray(lesson.resources)) {
            safeResources = lesson.resources
              .filter(r => {
                // Skip anything that's not a plain object
                if (!r || typeof r !== 'object' || Array.isArray(r) || typeof r === 'string') {
                  return false;
                }
                // Only include objects with required fields
                return r.title && r.url;
              })
              .map(r => ({
                title: String(r.title || '').trim(),
                url: String(r.url || '').trim(),
                type: String(r.type || 'pdf').trim()
              }));
          }
        }
        
        // Return clean lesson object
        return {
          title: String(lesson.title || ''),
          description: String(lesson.description || ''),
          videoUrl: String(lesson.videoUrl || ''),
          duration: String(lesson.duration || ''),
          order: Number(lesson.order || 0),
          moduleId: String(lesson.moduleId || ''),
          moduleName: String(lesson.moduleName || ''),
          resources: safeResources
        };
      });

      const finalPayload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        image: courseData.image,
        isPublished: courseData.isPublished,
        lessons: validatedLessons
      };
      
      // Final validation - ensure resources is always an array of plain objects
      const finalValidatedPayload = {
        ...finalPayload,
        lessons: finalPayload.lessons.map((lesson, idx) => {
          // Start with empty array
          let finalResources = [];
          
          // Only process if resources exists and is truthy
          if (lesson.resources) {
            // If resources is a string, try to parse it once
            let resourcesArray = lesson.resources;
            if (typeof resourcesArray === 'string') {
              try {
                resourcesArray = JSON.parse(resourcesArray);
              } catch (e) {
                console.error(`Lesson ${idx}: Failed to parse resources string`, e);
                resourcesArray = [];
              }
            }
            
            // Ensure it's an array
            if (Array.isArray(resourcesArray)) {
              // Process each element
              finalResources = resourcesArray
                .map((r, rIdx) => {
                  // If element is a string, try to parse it
                  if (typeof r === 'string') {
                    try {
                      const parsed = JSON.parse(r);
                      // If parsed is an array, take first object or return null
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        r = parsed[0]; // Take first object from array
                      } else if (parsed && typeof parsed === 'object') {
                        r = parsed;
                      } else {
                        return null;
                      }
                    } catch (e) {
                      console.error(`Lesson ${idx}, Resource ${rIdx}: Failed to parse string resource`, e);
                      return null;
                    }
                  }
                  
                  // Must be a plain object (not array, not null, not string)
                  if (r && typeof r === 'object' && !Array.isArray(r)) {
                    // Create fresh object with only required fields
                    return {
                      title: String(r.title || '').trim(),
                      url: String(r.url || '').trim(),
                      type: String(r.type || 'pdf').trim()
                    };
                  }
                  
                  return null;
                })
                .filter(r => r !== null && r.title && r.url); // Remove nulls and invalid objects
            }
          }
          
          // Return lesson with validated resources
          return {
            title: String(lesson.title || ''),
            description: String(lesson.description || ''),
            videoUrl: String(lesson.videoUrl || ''),
            duration: String(lesson.duration || ''),
            order: Number(lesson.order || 0),
            moduleId: String(lesson.moduleId || ''),
            moduleName: String(lesson.moduleName || ''),
            resources: finalResources // Always an array of objects
          };
        })
      };

      // Final safety check - ensure all resources are arrays of objects
      // This is critical - we must ensure resources is NEVER a string
      const safePayload = {
        ...finalValidatedPayload,
        lessons: finalValidatedPayload.lessons.map((lesson, lessonIdx) => {
          // Start with empty array
          let safeResources = [];
          
          // If resources exists, process it
          if (lesson.resources) {
            // If resources is a string, this is a critical error - log it
            if (typeof lesson.resources === 'string') {
              console.error(`CRITICAL: Lesson ${lessonIdx} resources is a STRING!`, lesson.resources.substring(0, 200));
              // Try to parse it
              try {
                const parsed = JSON.parse(lesson.resources);
                if (Array.isArray(parsed)) {
                  lesson.resources = parsed;
                } else {
                  lesson.resources = [];
                }
              } catch (e) {
                console.error(`Failed to parse resources string for lesson ${lessonIdx}`, e);
                lesson.resources = [];
              }
            }
            
            // Now process as array
            if (Array.isArray(lesson.resources)) {
              safeResources = lesson.resources
                .map((r, rIdx) => {
                  // If element is a string, this is an error
                  if (typeof r === 'string') {
                    console.error(`CRITICAL: Lesson ${lessonIdx}, Resource ${rIdx} is a STRING!`, r.substring(0, 200));
                    // Try to parse it
                    try {
                      const parsed = JSON.parse(r);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        r = parsed[0];
                      } else if (parsed && typeof parsed === 'object') {
                        r = parsed;
                      } else {
                        return null;
                      }
                    } catch (e) {
                      console.error(`Failed to parse resource string`, e);
                      return null;
                    }
                  }
                  
                  // Must be a plain object
                  if (r && typeof r === 'object' && !Array.isArray(r)) {
                    return {
                      title: String(r.title || '').trim(),
                      url: String(r.url || '').trim(),
                      type: String(r.type || 'pdf').trim()
                    };
                  }
                  
                  return null;
                })
                .filter(r => r !== null && r.title && r.url);
            }
          }
          
          // Final validation - ensure resources is an array
          if (!Array.isArray(safeResources)) {
            console.error(`CRITICAL: Lesson ${lessonIdx} safeResources is not an array!`, typeof safeResources);
            safeResources = [];
          }
          
          return {
            title: String(lesson.title || ''),
            description: String(lesson.description || ''),
            videoUrl: String(lesson.videoUrl || ''),
            duration: String(lesson.duration || ''),
            order: Number(lesson.order || 0),
            moduleId: String(lesson.moduleId || ''),
            moduleName: String(lesson.moduleName || ''),
            resources: safeResources // Always an array
          };
        })
      };

      // CRITICAL: Completely rebuild resources array from scratch
      // This ensures NO strings can get through
      const readyToSendPayload = {
        title: safePayload.title,
        description: safePayload.description,
        category: safePayload.category,
        level: safePayload.level,
        duration: safePayload.duration,
        image: safePayload.image,
        isPublished: safePayload.isPublished,
        lessons: safePayload.lessons.map((lesson, idx) => {
          // Start with completely fresh resources array
          const finalResources = [];
          
          // Only process if resources exists
          if (lesson.resources) {
            // If resources is a string, this is a critical error
            if (typeof lesson.resources === 'string') {
              console.error(`CRITICAL ERROR: Lesson ${idx} resources is a STRING!`, lesson.resources.substring(0, 200));
              // Don't try to parse - just skip it
            } 
            // If it's an array, process each element
            else if (Array.isArray(lesson.resources)) {
              lesson.resources.forEach((r, rIdx) => {
                // CRITICAL: If element is a string, log and skip completely
                if (typeof r === 'string') {
                  console.error(`CRITICAL ERROR: Lesson ${idx}, Resource ${rIdx} element is STRING!`, r.substring(0, 200));
                  return; // Skip this element
                }
                
                // Must be a plain object (not array, not null, not string)
                if (r && typeof r === 'object' && !Array.isArray(r)) {
                  // Extract values and create fresh object
                  const title = r.title;
                  const url = r.url;
                  const type = r.type;
                  
                  // Only add if title and url are valid strings
                  if (title && url && typeof title === 'string' && typeof url === 'string') {
                    finalResources.push({
                      title: title.trim(),
                      url: url.trim(),
                      type: (type && typeof type === 'string') ? type.trim() : 'pdf'
                    });
                  }
                }
              });
            }
          }
          
          // Return lesson with ONLY the validated resources
          return {
            title: String(lesson.title || ''),
            description: String(lesson.description || ''),
            videoUrl: String(lesson.videoUrl || ''),
            duration: String(lesson.duration || ''),
            order: Number(lesson.order || 0),
            moduleId: String(lesson.moduleId || ''),
            moduleName: String(lesson.moduleName || ''),
            resources: finalResources // Always an array of objects, never strings
          };
        })
      };

      // Debug: Log final payload structure
      console.log('=== FINAL PAYLOAD DEBUG ===');
      console.log('First lesson resources:', readyToSendPayload.lessons[0]?.resources);
      console.log('Resources is array:', Array.isArray(readyToSendPayload.lessons[0]?.resources));
      if (readyToSendPayload.lessons[0]?.resources?.length > 0) {
        console.log('First resource element:', readyToSendPayload.lessons[0].resources[0]);
        console.log('First resource element type:', typeof readyToSendPayload.lessons[0].resources[0]);
        console.log('First resource element keys:', Object.keys(readyToSendPayload.lessons[0].resources[0]));
        console.log('First resource element JSON:', JSON.stringify(readyToSendPayload.lessons[0].resources[0]));
      }
      
      // Test JSON serialization
      try {
        const testString = JSON.stringify(readyToSendPayload.lessons[0]?.resources);
        console.log('Resources JSON stringified:', testString);
        const testParsed = JSON.parse(testString);
        console.log('Resources parsed back:', testParsed);
        console.log('Parsed is array:', Array.isArray(testParsed));
        if (testParsed.length > 0) {
          console.log('Parsed first element type:', typeof testParsed[0]);
        }
      } catch (e) {
        console.error('JSON serialization test failed:', e);
      }
      
      // FINAL CRITICAL CHECK: Verify NO strings in resources arrays
      readyToSendPayload.lessons.forEach((lesson, idx) => {
        if (lesson.resources && Array.isArray(lesson.resources)) {
          lesson.resources.forEach((r, rIdx) => {
            if (typeof r === 'string') {
              console.error(`CRITICAL: Lesson ${idx}, Resource ${rIdx} is STRING before sending!`, r.substring(0, 200));
              throw new Error(`Resource ${rIdx} in lesson ${idx} is a string! This should never happen.`);
            }
            if (!r || typeof r !== 'object' || Array.isArray(r)) {
              console.error(`CRITICAL: Lesson ${idx}, Resource ${rIdx} is invalid!`, typeof r, r);
              throw new Error(`Resource ${rIdx} in lesson ${idx} is invalid!`);
            }
          });
        }
      });
      
      // Test the actual JSON that will be sent
      try {
        const jsonString = JSON.stringify(readyToSendPayload);
        const parsedBack = JSON.parse(jsonString);
        console.log('JSON round-trip test passed');
        
        // Check parsed version
        if (parsedBack.lessons && parsedBack.lessons[0]?.resources) {
          const firstResource = parsedBack.lessons[0].resources[0];
          console.log('After JSON round-trip, first resource type:', typeof firstResource);
          if (typeof firstResource === 'string') {
            console.error('CRITICAL: After JSON round-trip, first resource is a STRING!', firstResource.substring(0, 200));
            throw new Error('JSON serialization is corrupting the data!');
          }
        }
      } catch (e) {
        console.error('JSON round-trip test failed:', e);
        throw e;
      }
      
      console.log('=== END DEBUG ===');

      if (isEditMode) {
        await adminAPI.updateCourse(course._id, readyToSendPayload);
        alert('Course updated successfully!');
      } else {
        await courseAPI.create(readyToSendPayload);
        alert('Course created successfully!');
      }

      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Initialize Quill editor
  useEffect(() => {
    // Only initialize if ref exists
    if (!quillRef.current) {
      return;
    }

    // Check if Quill is already initialized in this container (handles StrictMode double render)
    if (quillRef.current.querySelector('.ql-toolbar') || quillInstanceRef.current || isInitializingRef.current) {
      return;
    }

    // Set flag to prevent duplicate initialization
    isInitializingRef.current = true;

    // Clear any existing content in the ref
    quillRef.current.innerHTML = '';

    let quill;
    try {
      quill = new Quill(quillRef.current, {
      theme: 'snow',
      placeholder: 'Describe what students will learn in this course...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link', 'image'],
          ['clean']
        ]
      },
      formats: [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'script', 'indent',
        'color', 'background', 'align',
        'link', 'image'
      ]
      });
    } catch (error) {
      console.error('Error initializing Quill:', error);
      return;
    }

    // Set initial content if editing
    if (courseData.description) {
      quill.root.innerHTML = courseData.description;
    }

    // Listen for text changes
    quill.on('text-change', () => {
      const content = quill.root.innerHTML;
      isQuillChangeRef.current = true;
      setCourseData(prev => ({ ...prev, description: content }));
    });

    quillInstanceRef.current = quill;
    isInitializingRef.current = false;

    // Cleanup function
    return () => {
      isInitializingRef.current = false;
      if (quillInstanceRef.current && quillRef.current) {
        // Remove event listeners
        quillInstanceRef.current.off('text-change');
        // Clear the container
        if (quillRef.current) {
          quillRef.current.innerHTML = '';
        }
        // Clear the instance
        quillInstanceRef.current = null;
      }
    };
  }, []);

  // Update Quill content when courseData.description changes externally (not from Quill)
  useEffect(() => {
    if (quillInstanceRef.current && !isQuillChangeRef.current) {
      const currentContent = quillInstanceRef.current.root.innerHTML;
      // Only update if the description is different from current content
      if (courseData.description !== currentContent) {
        quillInstanceRef.current.root.innerHTML = courseData.description || '';
      }
    }
    // Reset the flag after processing
    isQuillChangeRef.current = false;
  }, [courseData.description]);

  // Helper function to check if description has actual content (not just empty HTML tags)
  const hasDescriptionContent = (html) => {
    if (!html) return false;
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 0;
  };

  // Initialize Quill editor for video description in Module Builder
  // This should work for both adding new videos and editing existing ones
  useEffect(() => {
    // Only initialize if ref exists
    if (!videoQuillRefs.current['video-desc']) {
      return;
    }

    const container = videoQuillRefs.current['video-desc'];
    const parentContainer = container?.parentElement; // The div with id="quill-video-desc-container"
    
    // Check if Quill is already initialized (both instance and DOM)
    if (videoQuillInstances.current['video-desc'] && 
        parentContainer && 
        parentContainer.querySelector('.ql-toolbar')) {
      // Already initialized and connected to DOM
      return;
    }

    // Clean up any existing instance or DOM elements
    if (videoQuillInstances.current['video-desc']) {
      try {
        videoQuillInstances.current['video-desc'].off('text-change');
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
      videoQuillInstances.current['video-desc'] = null;
    }

    // Clean up any existing Quill DOM elements
    if (parentContainer) {
      const toolbar = parentContainer.querySelector('.ql-toolbar');
      if (toolbar) toolbar.remove();
      const qlContainer = parentContainer.querySelector('.ql-container');
      if (qlContainer) qlContainer.remove();
    }
    if (container) {
      container.innerHTML = '';
    }

    // Prevent duplicate initialization
    if (videoQuillInitializingRef.current['video-desc']) {
      return;
    }

    // Set flag to prevent duplicate initialization
    videoQuillInitializingRef.current['video-desc'] = true;

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        const quill = new Quill(container, {
          theme: 'snow',
          placeholder: 'Describe what students will learn in this video...',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'color': [] }, { 'background': [] }],
              ['link'],
              ['clean']
            ]
          },
          formats: [
            'header', 'bold', 'italic', 'underline', 'strike',
            'list', 'bullet', 'indent',
            'color', 'background',
            'link'
          ]
        });

        // Listen for text changes
        quill.on('text-change', () => {
          const content = quill.root.innerHTML;
          videoQuillChangeRef.current['video-desc'] = true;
          setCurrentVideo(prev => ({ ...prev, description: content }));
        });

        videoQuillInstances.current['video-desc'] = quill;
        videoQuillInitializingRef.current['video-desc'] = false;
        
        // Set initial content from currentVideo
        const description = currentVideo.description || '';
        if (quill && quill.root && description) {
          quill.root.innerHTML = description;
        }
      } catch (error) {
        console.error('Error initializing video Quill:', error);
        videoQuillInitializingRef.current['video-desc'] = false;
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      videoQuillInitializingRef.current['video-desc'] = false;
    };
  }, [editingVideoId]); // Re-initialize when switching between edit/add modes

  // Update video Quill content when currentVideo.description changes externally or when editingVideoId changes
  useEffect(() => {
    // Only update if we're editing a video
    if (editingVideoId === null) {
      videoQuillChangeRef.current['video-desc'] = false;
      return;
    }

    let retryCount = 0;
    const maxRetries = 20; // Allow more retries for smoother experience

    // Wait for editor to be initialized if it's not ready yet
    const updateContent = () => {
      const quill = videoQuillInstances.current['video-desc'];
      if (!quill || !quill.root) {
        // Editor not ready yet, try again after a short delay (with retry limit)
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(updateContent, 30); // Faster retry for smoother experience
        }
        return;
      }

      const currentContent = quill.root.innerHTML.trim();
      const newContent = (currentVideo.description || '').trim();
      
      // Only update if content is different and it's not a user-initiated change
      if (currentContent !== newContent && !videoQuillChangeRef.current['video-desc']) {
        quill.root.innerHTML = newContent;
      }
      
      // Reset the flag after successful update
      videoQuillChangeRef.current['video-desc'] = false;
    };

    // Use requestAnimationFrame for smooth, immediate updates
    requestAnimationFrame(updateContent);
  }, [currentVideo.description, editingVideoId]);

  // Scroll to module editor when editing a module
  useEffect(() => {
    if (editingModuleId && moduleEditorRef.current) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = moduleEditorRef.current;
          if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 20; // 20px offset from top
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }, [editingModuleId]);

  // Scroll to video editor when editing a video
  useEffect(() => {
    if (editingVideoId && videoEditorRef.current) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = videoEditorRef.current;
          if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 20; // 20px offset from top
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }, [editingVideoId]);

  // Initialize Quill editors for inline video editing in modules
  useEffect(() => {
    if (!editingVideoInModule) {
      return;
    }

    const videoKey = editingVideoInModule;
    const container = videoQuillRefs.current[videoKey];
    
    if (!container) {
      return;
    }

    const parentContainer = container?.parentElement;
    
    // Clean up existing instance if any
    if (videoQuillInstances.current[videoKey]) {
      try {
        videoQuillInstances.current[videoKey].off('text-change');
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
      
      if (parentContainer) {
        const toolbar = parentContainer.querySelector('.ql-toolbar');
        if (toolbar) toolbar.remove();
        const qlContainer = parentContainer.querySelector('.ql-container');
        if (qlContainer) qlContainer.remove();
      }
      
      container.innerHTML = '';
      videoQuillInstances.current[videoKey] = null;
    }

    // Check if Quill is already initialized
    if (parentContainer && parentContainer.querySelector('.ql-toolbar')) {
      return;
    }

    // Prevent duplicate initialization
    if (videoQuillInitializingRef.current[videoKey]) {
      return;
    }

    videoQuillInitializingRef.current[videoKey] = true;

    // Initialize Quill with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        const quill = new Quill(container, {
          theme: 'snow',
          placeholder: 'Describe what students will learn in this video...',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'color': [] }, { 'background': [] }],
              ['link'],
              ['clean']
            ]
          },
          formats: [
            'header', 'bold', 'italic', 'underline', 'strike',
            'list', 'bullet', 'indent',
            'color', 'background',
            'link'
          ]
        });

        // Set initial content - the content update useEffect will handle this
        // But set it here as fallback for immediate display
        const description = editingVideoData.description || '';
        if (description) {
          quill.root.innerHTML = description;
        }

        // Listen for text changes
        quill.on('text-change', () => {
          const content = quill.root.innerHTML;
          videoQuillChangeRef.current[videoKey] = true;
          setEditingVideoData(prev => ({ ...prev, description: content }));
        });

        videoQuillInstances.current[videoKey] = quill;
        videoQuillInitializingRef.current[videoKey] = false;
      } catch (error) {
        console.error('Error initializing inline video Quill:', error);
        videoQuillInitializingRef.current[videoKey] = false;
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      videoQuillInitializingRef.current[videoKey] = false;
    };
  }, [editingVideoInModule]);

  // Update Quill content when editingVideoData.description changes
  useEffect(() => {
    if (!editingVideoInModule) {
      return;
    }

    const videoKey = editingVideoInModule;
    const quill = videoQuillInstances.current[videoKey];
    
    if (!quill || !quill.root) {
      return;
    }

    const currentContent = quill.root.innerHTML.trim();
    const newContent = (editingVideoData.description || '').trim();
    
    // Only update if content is different and it's not a user-initiated change
    if (currentContent !== newContent && !videoQuillChangeRef.current[videoKey]) {
      quill.root.innerHTML = newContent;
    }
    
    // Reset the flag after processing
    videoQuillChangeRef.current[videoKey] = false;
  }, [editingVideoData.description, editingVideoInModule]);

  // Scroll to inline video editor when editing a video in module
  useEffect(() => {
    if (editingVideoInModule && inlineVideoEditorRefs.current[editingVideoInModule]) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = inlineVideoEditorRefs.current[editingVideoInModule];
          if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 20;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }, [editingVideoInModule]);

  const canSubmit = courseData.title && hasDescriptionContent(courseData.description) && courseData.duration && courseData.modules.length > 0;

  return (
    <div className="space-y-8 ,md:p-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-gray-500 mb-1">
            Course Forge
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[0.16em] uppercase flex items-center gap-3">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
            <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-cyan-400 via-[#99DBFF] to-transparent" />
          </h1>
        </div>

        <button 
          type="button" 
          onClick={onBack} 
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-200"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* Course Basic Info */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-3 md:p-6">
          <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
            Course Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="e.g., Complete Web Development"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Duration *
              </label>
              <input
                type="text"
                required
                value={courseData.duration}
                onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="e.g., 8 weeks"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Category *
              </label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
              >
                <option value="Development">Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Level *
              </label>
              <select
                value={courseData.level}
                onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Icon
              </label>
              <input
                type="text"
                value={courseData.image}
                onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="e.g., 📚"
              />
            </div>

            <div className="flex items-center mt-2">
              <div className="flex items-center gap-3">
                <span className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em]">
                  Publish
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCourseData((prev) => ({ ...prev, isPublished: !prev.isPublished }))
                  }
                  className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors ${
                    courseData.isPublished 
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-600' 
                      : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    courseData.isPublished ? 'translate-x-9' : 'translate-x-1'
                  }`} />
                  <span className={`absolute text-[10px] font-bold tracking-[0.08em] uppercase ${
                    courseData.isPublished 
                      ? 'left-2 text-white' 
                      : 'right-2 text-gray-700'
                  }`}>
                    {courseData.isPublished ? 'Live' : 'Draft'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
              Description *
            </label>
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden" id="quill-editor-container">
              <div ref={quillRef} className="text-gray-900" style={{ minHeight: '200px' }} />
            </div>
            <style>{`
              #quill-editor-container .ql-container {
                min-height: 150px;
                font-size: 14px;
              }
              #quill-editor-container .ql-editor {
                min-height: 150px;
              }
              #quill-editor-container .ql-editor.ql-blank::before {
                color: #9ca3af;
                font-style: normal;
              }
              #quill-editor-container .ql-toolbar {
                border-top: 1px solid #ccc;
                border-left: 1px solid #ccc;
                border-right: 1px solid #ccc;
                border-bottom: none;
                border-radius: 0.5rem 0.5rem 0 0;
              }
              #quill-editor-container .ql-container {
                border-bottom: 1px solid #ccc;
                border-left: 1px solid #ccc;
                border-right: 1px solid #ccc;
                border-top: none;
                border-radius: 0 0 0.5rem 0.5rem;
              }
            `}</style>
          </div>
        </div>

        {/* Current Module Builder */}
        <div ref={moduleEditorRef} className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-3 md:p-6">
          <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4 flex items-center justify-between gap-3">
            {editingModuleId ? 'Edit Module' : 'Module Builder'}
            <span className="text-[10px] md:text-xs text-gray-500 tracking-[0.18em] uppercase">
              {editingModuleId ? 'Editing Module' : `Stage ${courseData.modules.length + 1}`}
            </span>
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Module Title
              </label>
              <input
                type="text"
                value={currentModule.title}
                onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="e.g., Introduction to JavaScript"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                Module Description
              </label>
              <textarea
                rows={2}
                value={currentModule.description}
                onChange={(e) =>
                  setCurrentModule({ ...currentModule, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                placeholder="Describe this module..."
              />
            </div>

            {/* Videos */}
            <div ref={videoEditorRef} className="border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-800 tracking-[0.16em] uppercase mb-3">
                Videos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 mt-3">
                <input
                  type="text"
                  value={currentVideo.title}
                  onChange={(e) =>
                    setCurrentVideo({ ...currentVideo, title: e.target.value })
                  }
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Video title"
                />
                <input
                  type="text"
                  value={currentVideo.url}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Video URL"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentVideo.duration}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, duration: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Duration"
                  />
                  <button
                    type="button"
                    onClick={addVideo}
                    className={`px-3 py-2 text-[11px] rounded-lg text-white shadow-md transition-all duration-200 ${
                      editingVideoId !== null
                        ? 'bg-gradient-to-r from-amber-600 to-amber-600 shadow-amber-500/20 hover:shadow-amber-500/40'
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-600 shadow-cyan-500/20 hover:shadow-cyan-500/40'
                    }`}
                  >
                    {editingVideoId !== null ? 'Update' : 'Add'}
                  </button>
                  {editingVideoId !== null && (
                    <button
                      type="button"
                      onClick={cancelEditVideo}
                      className="px-3 py-2 text-[11px] rounded-lg bg-gradient-to-r from-red-500 to-red-500 text-white shadow-md shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                  Video Description
                </label>
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden" id="quill-video-desc-container">
                  <div 
                    ref={el => { 
                      if (el) {
                        videoQuillRefs.current['video-desc'] = el;
                      }
                    }}
                    className="text-gray-900" 
                    style={{ minHeight: '150px' }} 
                  />
                </div>
                <style>{`
                  #quill-video-desc-container .ql-container {
                    min-height: 120px;
                    font-size: 14px;
                  }
                  #quill-video-desc-container .ql-editor {
                    min-height: 120px;
                  }
                  #quill-video-desc-container .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                  }
                  #quill-video-desc-container .ql-toolbar {
                    border-top: 1px solid #ccc;
                    border-left: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    border-bottom: none;
                    border-radius: 0.5rem 0.5rem 0 0;
                  }
                  #quill-video-desc-container .ql-container {
                    border-bottom: 1px solid #ccc;
                    border-left: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    border-top: none;
                    border-radius: 0 0 0.5rem 0.5rem;
                  }
                `}</style>
              </div>

              {currentModule.videos.length > 0 && (
                <div className="space-y-3">
                  {currentModule.videos.map((video) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-xl bg-white border border-gray-300 hover:border-gray-400 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {video.title}
                        </p>
                        <p className="text-[11px] text-gray-600 break-all">
                          {video.url} • {video.duration || 'No duration'}
                        </p>
                          {video.description && (
                            <div className="text-[11px] text-gray-700 mt-2 bg-blue-50 p-2 rounded prose prose-sm max-w-none" 
                              dangerouslySetInnerHTML={{ __html: video.description }}>
                      </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => editVideo(video)}
                            className="text-blue-500 hover:text-blue-600 text-[11px] transition-colors font-medium"
                          >
                            Edit
                          </button>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                            className="text-red-500 hover:text-red-600 text-[11px] transition-colors font-medium"
                      >
                        Remove
                      </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-800 tracking-[0.16em] uppercase mb-3">
                Files & Resources
              </h3>

              <div className="space-y-3 mb-3 mt-3">
                <div className="flex gap-3">
                <input
                  type="text"
                  value={currentFile.title}
                  onChange={(e) =>
                    setCurrentFile({ ...currentFile, title: e.target.value })
                  }
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="File title (optional, will use filename if empty)"
                  />
                  <label className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg cursor-pointer hover:from-cyan-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2">
                    {uploadingFile ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        <span>Choose PDF</span>
                      </>
                    )}
                <input
                      id="file-upload-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                  </label>
                </div>
                {currentFile.url && (
                  <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    ✓ File uploaded: {currentFile.title || 'PDF file'}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addFile}
                    disabled={!currentFile.url || uploadingFile}
                    className="flex-1 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add File to Module
                  </button>
                </div>
              </div>

              {currentModule.files.length > 0 && (
                <div className="space-y-2">
                  {currentModule.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {file.title}
                        </p>
                        <p className="text-[11px] text-gray-600 break-all">
                          {file.type.toUpperCase()} • {file.url}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-600 text-[11px] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={addModule}
                disabled={!currentModule.title}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingModuleId ? 'Update Module' : 'Add Module to Course'}
              </button>
              {editingModuleId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingModuleId(null);
                    setCurrentModule({
                      title: '',
                      description: '',
                      videos: [],
                      files: [],
                      quiz: null,
                      assignment: null
                    });
                  }}
                  className="px-4 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 transition-all duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Added Modules */}
        {courseData.modules.length > 0 && (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-3 md:p-6">
            <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
              Course Modules ({courseData.modules.length})
            </h2>

            <div className="mt-4 space-y-4">
              {courseData.modules.map((module, index) => {
                const videoKeyPrefix = module.id;
                return (
                  <div key={module.id} className="rounded-xl bg-white border border-gray-300 p-4">
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          Module {index + 1}: {module.title}
                        </p>
                        {module.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {module.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-gray-500">
                          <span>📹 {module.videos.length} videos</span>
                          <span>📄 {module.files.length} files</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => editModule(module.id)}
                          className="px-3 py-1.5 text-[11px] rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                          Edit Module
                        </button>
                        <button
                          type="button"
                          onClick={() => removeModule(module.id)}
                          className="text-red-500 hover:text-red-600 text-[11px] transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Videos in Module */}
                    {module.videos.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                        {module.videos.map((video) => {
                          const videoKey = `${videoKeyPrefix}-${video.id}`;
                          const isEditing = editingVideoInModule === videoKey;
                          return (
                            <div key={video.id}>
                              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {video.title}
                                    </p>
                                    <p className="text-[11px] text-gray-600 break-all mt-1">
                                      {video.url} • {video.duration || 'No duration'}
                                    </p>
                                    {video.description && !isEditing && (
                                      <div 
                                        className="text-[11px] text-gray-700 mt-2 bg-blue-50 p-2 rounded prose prose-sm max-w-none" 
                                        dangerouslySetInnerHTML={{ __html: video.description }}
                                      />
                                    )}
                                  </div>
                                  <div className="flex gap-2 ml-2 whitespace-nowrap">
                                    {!isEditing ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => editVideoInModule(module.id, video)}
                                          className="text-blue-500 hover:text-blue-600 text-[11px] transition-colors font-medium"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeVideoFromModule(module.id, video.id)}
                                          className="text-red-500 hover:text-red-600 text-[11px] transition-colors font-medium"
                                        >
                                          Remove
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => saveVideoInModule(module.id, video.id)}
                                          className="px-2 py-1 text-[11px] rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => cancelEditVideoInModule(module.id, video.id)}
                                          className="px-2 py-1 text-[11px] rounded bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Inline Video Editor */}
                              {isEditing && (
                                <div 
                                  ref={el => {
                                    if (el) {
                                      inlineVideoEditorRefs.current[videoKey] = el;
                                    }
                                  }}
                                  className="mt-2 p-4 rounded-xl bg-white border-2 border-blue-300 shadow-lg"
                                >
                                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-[0.16em] mb-3">
                                    Edit Video
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <input
                                      type="text"
                                      value={editingVideoData.title || ''}
                                      onChange={(e) =>
                                        setEditingVideoData({ ...editingVideoData, title: e.target.value })
                                      }
                                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                      placeholder="Video title"
                                    />
                                    <input
                                      type="text"
                                      value={editingVideoData.url || ''}
                                      onChange={(e) =>
                                        setEditingVideoData({ ...editingVideoData, url: e.target.value })
                                      }
                                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                      placeholder="Video URL"
                                    />
                                    <input
                                      type="text"
                                      value={editingVideoData.duration || ''}
                                      onChange={(e) =>
                                        setEditingVideoData({ ...editingVideoData, duration: e.target.value })
                                      }
                                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                      placeholder="Duration"
                                    />
                                  </div>

                                  <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-[0.18em] mb-2">
                                      Video Description
                                    </label>
                                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden" id={`quill-video-desc-container-${videoKey}`}>
                                      <div 
                                        ref={el => { 
                                          if (el) {
                                            videoQuillRefs.current[videoKey] = el;
                                          }
                                        }}
                                        className="text-gray-900" 
                                        style={{ minHeight: '150px' }} 
                                      />
                                    </div>
                                    <style>{`
                                      #quill-video-desc-container-${videoKey} .ql-container {
                                        min-height: 120px;
                                        font-size: 14px;
                                      }
                                      #quill-video-desc-container-${videoKey} .ql-editor {
                                        min-height: 120px;
                                      }
                                      #quill-video-desc-container-${videoKey} .ql-editor.ql-blank::before {
                                        color: #9ca3af;
                                        font-style: normal;
                                      }
                                      #quill-video-desc-container-${videoKey} .ql-toolbar {
                                        border-top: 1px solid #ccc;
                                        border-left: 1px solid #ccc;
                                        border-right: 1px solid #ccc;
                                        border-bottom: none;
                                        border-radius: 0.5rem 0.5rem 0 0;
                                      }
                                      #quill-video-desc-container-${videoKey} .ql-container {
                                        border-bottom: 1px solid #ccc;
                                        border-left: 1px solid #ccc;
                                        border-right: 1px solid #ccc;
                                        border-top: none;
                                        border-radius: 0 0 0.5rem 0.5rem;
                                      }
                                    `}</style>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Row */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="flex-1 justify-center py-3 text-xs md:text-sm rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-cyan-500/30"
          >
            {loading
              ? isEditMode
                ? 'Saving Changes...'
                : 'Creating Course...'
              : isEditMode
              ? 'Save Changes'
              : 'Create Course'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-xs md:text-sm rounded-xl bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseCreate;