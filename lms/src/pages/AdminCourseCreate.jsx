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
  const [deletedModuleIds, setDeletedModuleIds] = useState([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState([]);

  // --- RESOURCES (where they live & how they're saved) ---
  // Backend: resources exist only on LESSONS (DB column lesson.resources = JSON array of { title, url }).
  // Upload: User picks PDF → POST /api/admin/upload → file goes to Cloudinary (folder lms/course-resources) → API returns { file: { url } }.
  // In UI we show "Files & Resources" per module (module.files). On save we write them into one lesson per module titled "Resources" (no video), so they appear under that module for students.

  const [editingModuleId, setEditingModuleId] = useState(null);
  const isEditMode = !!(course && (course.id ?? course._id));
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

  // When opening for edit: list API returns courses without modules/lessons.
  // Fetch full course (GET /api/admin/courses/:id) and map course.modules[].lessons to UI shape.
  useEffect(() => {
    if (!course) return;

    const courseId = course.id ?? course._id;
    if (!courseId) {
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'Development',
        level: course.level || 'Beginner',
        duration: course.duration || '',
        image: course.image || '📚',
        isPublished: course.is_published ?? course.isPublished ?? false,
        modules: []
      });
      return;
    }

    let cancelled = false;

    const loadCourseForEdit = async () => {
      try {
        const res = await adminAPI.getCourseById(courseId);
        const fullCourse = res.course || res;
        if (cancelled) return;

        // Backend: resources live only on LESSONS (lesson.resources = [{ title, url }]).
        // Upload: PDF → POST /api/admin/upload → Cloudinary → URL. That URL goes into a lesson's resources.
        // In UI we show "module-level" files; when saving we store them in one "Resources" lesson per module.
        const backendModules = fullCourse.modules || [];
        const modulesForUI = backendModules.map((mod) => {
          const lessons = mod.lessons || [];
          const videos = [];
          const files = [];
          let resourceLessonId = null;
          lessons.forEach((lesson) => {
            const videoUrl = lesson.video_url ?? lesson.videoUrl;
            if (videoUrl) {
              videos.push({
                id: lesson.id ?? lesson._id ?? Date.now() + Math.random(),
                title: lesson.title || '',
                url: videoUrl,
                duration: lesson.duration || '',
                description: lesson.description || '',
                isNew: false
              });
            } else {
              resourceLessonId = lesson.id ?? lesson._id;
              const resList = lesson.resources || [];
              const arr = Array.isArray(resList) ? resList : [];
              arr.forEach((r) => {
                if (r && r.title && r.url) {
                  files.push({
                    id: r.id ?? r._id ?? Date.now() + Math.random(),
                    title: r.title,
                    url: r.url,
                    type: r.type || 'pdf'
                  });
                }
              });
            }
          });
          return {
            id: mod.id ?? mod._id,
            title: mod.title || '',
            description: mod.description || '',
            videos,
            files,
            resourceLessonId,
            quiz: null,
            assignment: null,
            isNew: false
          };
        });

        setCourseData({
          title: fullCourse.title || '',
          description: fullCourse.description || '',
          category: fullCourse.category || 'Development',
          level: fullCourse.level || 'Beginner',
          duration: fullCourse.duration || '',
          image: fullCourse.image || '📚',
          isPublished: fullCourse.is_published ?? fullCourse.isPublished ?? false,
          modules: modulesForUI
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load course for edit:', err);
          setCourseData({
            title: course.title || '',
            description: course.description || '',
            category: course.category || 'Development',
            level: course.level || 'Beginner',
            duration: course.duration || '',
            image: course.image || '📚',
            isPublished: course.is_published ?? course.isPublished ?? false,
            modules: []
          });
        }
      }
    };

    loadCourseForEdit();
    return () => { cancelled = true; };
  }, [course]);

  const addVideo = () => {
    if (currentVideo.title && currentVideo.url) {
      if (editingVideoId !== null) {
        // Update existing video
        setCurrentModule((prev) => ({
          ...prev,
          videos: prev.videos.map((v) =>
            v.id === editingVideoId
              ? { ...currentVideo, id: editingVideoId, isNew: v.isNew }
              : v
          )
        }));
        setEditingVideoId(null);
      } else {
        // Add new video
        setCurrentModule((prev) => ({
          ...prev,
          videos: [
            ...prev.videos,
            { ...currentVideo, id: Date.now(), isNew: true }
          ]
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
    setCourseData((prev) => {
      const nextModules = prev.modules.map((m) => {
        if (m.id !== moduleId) return m;

        const videos = Array.isArray(m.videos) ? m.videos : [];
        const videoToRemove = videos.find((v) => v.id === videoId);

        // Track deletion only for existing backend lessons (isNew === false)
        if (videoToRemove && !videoToRemove.isNew && videoToRemove.id != null) {
          setDeletedLessonIds((prevDeleted) => [...prevDeleted, Number(videoToRemove.id)]);
        }

        return {
          ...m,
          videos: videos.filter((v) => v.id !== videoId)
        };
      });

      return {
        ...prev,
        modules: nextModules
      };
    });
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
            m.id === editingModuleId
              ? { ...currentModule, id: m.id, isNew: m.isNew }
              : m
          )
        }));
        setEditingModuleId(null);
        alert('Module updated successfully!');
      } else {
        // Add new module
        setCourseData((prev) => ({
          ...prev,
          modules: [
            ...prev.modules,
            { ...currentModule, id: Date.now(), isNew: true }
          ]
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
    setCourseData((prev) => {
      const moduleToRemove = prev.modules.find((m) => m.id === moduleId);

      // Track deletion only for existing backend modules (isNew === false)
      if (moduleToRemove && !moduleToRemove.isNew && moduleToRemove.id != null) {
        setDeletedModuleIds((prevDeleted) => [...prevDeleted, moduleToRemove.id]);
      }

      return {
        ...prev,
        modules: prev.modules.filter((m) => m.id !== moduleId)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseId = course?.id ?? course?._id;

      // EDIT FLOW: update base course fields + persist any NEW modules/lessons
      if (isEditMode && courseId) {
        const updatePayload = {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          duration: courseData.duration,
          image: courseData.image,
          is_published: courseData.isPublished
        };

        await adminAPI.updateCourse(courseId, updatePayload);

        // Persist new modules and new lessons using admin APIs; then set lesson order via reorder API
        const modules = courseData.modules || [];
        for (let i = 0; i < modules.length; i++) {
          const mod = modules[i];
          let backendModuleId = mod.id;

          // If this is a brand new module in UI, create it via POST /api/admin/modules
          if (mod.isNew) {
            const modRes = await adminAPI.createModule({
              courseId,
              title: mod.title,
              description: mod.description || '',
              order: i + 1
            });
            const createdModule = modRes.module || modRes.data?.module || modRes;
            backendModuleId = createdModule.id || createdModule._id;
          }

          const videosArray = Array.isArray(mod.videos) ? mod.videos : [];
          const orderedLessonIds = [];

          // Video lessons in UI order: existing keep id, new ones create and collect id
          for (let j = 0; j < videosArray.length; j++) {
            const video = videosArray[j];
            if (!video || !video.title || !video.url) continue;
            if (video.isNew) {
              const createRes = await adminAPI.createLesson({
                moduleId: backendModuleId,
                title: video.title,
                description: video.description || '',
                videoUrl: video.url,
                duration: video.duration || '',
                order: j + 1,
                resources: []
              });
              const createdId = createRes.lesson?.id ?? createRes.lesson?._id ?? createRes.id;
              if (createdId != null) orderedLessonIds.push(Number(createdId));
            } else {
              const bid = video.id ?? video._id;
              if (bid != null) orderedLessonIds.push(Number(bid));
            }
          }

          // Resources: update existing or create; add to ordered list
          const moduleFiles = Array.isArray(mod.files) ? mod.files : [];
          const resourcesPayload = moduleFiles
            .filter((f) => f && f.title && f.url)
            .map((f) => ({ title: f.title, url: f.url }));

          if (mod.resourceLessonId && resourcesPayload.length >= 0) {
            await adminAPI.updateLesson(mod.resourceLessonId, {
              title: "Resources",
              description: "Downloadable resources for this module",
              videoUrl: "",
              duration: "",
              resources: resourcesPayload
            });
            orderedLessonIds.push(Number(mod.resourceLessonId));
          } else if (resourcesPayload.length > 0) {
            const createRes = await adminAPI.createLesson({
              moduleId: backendModuleId,
              title: "Resources",
              description: "Downloadable resources for this module",
              videoUrl: "",
              duration: "",
              order: Math.max(videosArray.length, 1) + 1,
              resources: resourcesPayload
            });
            const createdId = createRes.lesson?.id ?? createRes.lesson?._id ?? createRes.id;
            if (createdId != null) orderedLessonIds.push(Number(createdId));
          }

          // Sync backend order with UI order: PUT /api/admin/lessons/reorder/:moduleId
          if (orderedLessonIds.length > 0) {
            await adminAPI.reorderLessons(
              backendModuleId,
              orderedLessonIds.map((id, idx) => ({ id, order: idx + 1 }))
            );
          }
        }

        // Process deletions for existing lessons and modules
        // These are tracked when the user clicks "Remove" in the UI.
        if (deletedLessonIds.length > 0) {
          for (const lessonId of deletedLessonIds) {
            try {
              await adminAPI.deleteLesson(lessonId);
            } catch (err) {
              console.error('Failed to delete lesson', lessonId, err);
            }
          }
        }

        if (deletedModuleIds.length > 0) {
          for (const moduleId of deletedModuleIds) {
            try {
              await adminAPI.deleteModule(moduleId);
            } catch (err) {
              console.error('Failed to delete module', moduleId, err);
            }
          }
        }

        alert("Course updated successfully!");
        onSuccess && onSuccess();
        return;
      }

      // CREATE FLOW (admin) – exactly as per API docs:
      // 1) Create course via POST /api/admin/courses
      // 2) For each module in UI → POST /api/admin/modules
      // 3) For each video (lesson) inside module → POST /api/admin/lessons

      // 1) Resolve instructor (backend still requires instructorId + instructorName)
      let instructorId = null;
      let instructorName = "";
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser?.id) {
          const roles = storedUser.roles || [];
          const isAdmin =
            Array.isArray(roles) && roles.includes("ROLE_ADMIN");
          const isTeacher =
            Array.isArray(roles) && roles.includes("ROLE_TEACHER");
          if (isAdmin || isTeacher) {
            instructorId = storedUser.id;
            instructorName = storedUser.name || "Instructor";
          }
        }

        // Fallback: first available instructor from /api/admin/instructors
        if (!instructorId) {
          const instrRes = await adminAPI.getInstructors();
          const first = (instrRes.instructors || [])[0];
          if (first) {
            instructorId = first.id;
            instructorName = first.name || first.fullname || "Instructor";
          }
        }
      } catch (err) {
        console.error("Error resolving instructor:", err);
      }

      if (!instructorId) {
        alert(
          "No instructor found. Please ensure at least one teacher/admin exists."
        );
        setLoading(false);
        return;
      }

      // 2) Create base course (shape aligned with /api/admin/courses docs)
      const baseCoursePayload = {
        instructorId,
        instructorName,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: 0,
        image: courseData.image,
        thumbnail: "",
        learningOutcomes: [],
        prerequisites: []
      };

      const created = await adminAPI.createCourse(baseCoursePayload);
      const createdCourse = created.course || created.data?.course || created;
      const createdCourseId = createdCourse.id || createdCourse._id;

      // 3) For each module in UI → POST /api/admin/modules
      //    Body: { courseId, title, description, order }
        const createdModuleIds = [];
        for (let i = 0; i < courseData.modules.length; i++) {
          const module = courseData.modules[i];
          if (!module.title) continue;

          const modRes = await adminAPI.createModule({
            courseId: createdCourseId,
            title: module.title,
            description: module.description || "",
            order: i + 1
          });

          const createdModule = modRes.module || modRes.data?.module || modRes;
          const createdModuleId = createdModule.id || createdModule._id;

          createdModuleIds.push({
            localIndex: i,
            id: createdModuleId
          });

          const videosArray = Array.isArray(module.videos) ? module.videos : [];
          const orderedLessonIds = [];

          // 4) Video lessons → POST /api/admin/lessons; collect ids in UI order
          for (let j = 0; j < videosArray.length; j++) {
            const video = videosArray[j];
            if (!video.title || !video.url) continue;

            const createRes = await adminAPI.createLesson({
              moduleId: createdModuleId,
              title: video.title,
              description: video.description || "",
              videoUrl: video.url,
              duration: video.duration || "",
              order: j + 1,
              resources: []
            });
            const createdId = createRes.lesson?.id ?? createRes.lesson?._id ?? createRes.id;
            if (createdId != null) orderedLessonIds.push(Number(createdId));
          }

          // 5) One "Resources" lesson per module; add its id to ordered list
          const moduleFiles = Array.isArray(module.files) ? module.files : [];
          if (moduleFiles.length > 0) {
            const resourcesPayload = moduleFiles
              .filter((f) => f && f.title && f.url)
              .map((f) => ({ title: f.title, url: f.url }));
            if (resourcesPayload.length > 0) {
              const createRes = await adminAPI.createLesson({
                moduleId: createdModuleId,
                title: "Resources",
                description: "Downloadable resources for this module",
                videoUrl: "",
                duration: "",
                order: videosArray.length + 1,
                resources: resourcesPayload
              });
              const createdId = createRes.lesson?.id ?? createRes.lesson?._id ?? createRes.id;
              if (createdId != null) orderedLessonIds.push(Number(createdId));
            }
          }

          // Sync backend order with UI: PUT /api/admin/lessons/reorder/:moduleId
          if (orderedLessonIds.length > 0) {
            await adminAPI.reorderLessons(
              createdModuleId,
              orderedLessonIds.map((id, idx) => ({ id, order: idx + 1 }))
            );
          }
        }

      // 5) Optionally publish course if toggle is on
      if (courseData.isPublished) {
        await adminAPI.updateCoursePublishStatus(createdCourseId, true);
      }

      alert("Course created successfully!");
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course: " + (error.message || "Unknown error"));
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