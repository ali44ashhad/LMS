import React, { useState, useEffect } from 'react';
import { courseAPI, adminAPI } from '../services/api';

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
    duration: ''
  });

  const [currentFile, setCurrentFile] = useState({
    title: '',
    url: '',
    type: 'pdf'
  });

  const [editingModuleId, setEditingModuleId] = useState(null);
  const isEditMode = !!(course && course._id);

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
          description: lesson.description || '',
          videos: [],
          files: [],
          quiz: null,
          assignment: null
        });
      }
      
      const module = moduleMap.get(moduleId);
      
      // Add video to module
      if (lesson.videoUrl) {
        module.videos.push({
          id: lesson._id || (Date.now() + Math.random()),
          title: lesson.title || '',
          url: lesson.videoUrl,
          duration: lesson.duration || ''
        });
      }
      
      // Add files to module
      if (lesson.resources && Array.isArray(lesson.resources)) {
        lesson.resources.forEach((resource) => {
          module.files.push({
            ...resource,
            id: resource._id || resource.id || (Date.now() + Math.random())
          });
        });
      }
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
      setCurrentModule((prev) => ({
        ...prev,
        videos: [...prev.videos, { ...currentVideo, id: Date.now() }]
      }));
      setCurrentVideo({ title: '', url: '', duration: '' });
    }
  };

  const removeVideo = (videoId) => {
    setCurrentModule((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v.id !== videoId)
    }));
  };

  const addFile = () => {
    if (currentFile.title && currentFile.url) {
      setCurrentModule((prev) => ({
        ...prev,
        files: [...prev.files, { ...currentFile, id: Date.now() }]
      }));
      setCurrentFile({ title: '', url: '', type: 'pdf' });
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
      // Scroll to module builder
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const lessons = courseData.modules.flatMap((module, moduleIndex) =>
        module.videos.map((video, videoIndex) => ({
          title: video.title,
          description: module.description || `Module ${moduleIndex + 1}: ${module.title}`,
          videoUrl: video.url,
          duration: video.duration,
          order: moduleIndex * 100 + videoIndex,
          moduleId: `module-${moduleIndex}`,
          moduleName: module.title || `Module ${moduleIndex + 1}`,
          resources: module.files.map((file) => ({
            title: file.title,
            url: file.url,
            type: file.type
          }))
        }))
      );

      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        image: courseData.image,
        isPublished: courseData.isPublished,
        lessons
      };

      if (isEditMode) {
        await adminAPI.updateCourse(course._id, coursePayload);
        alert('Course updated successfully!');
      } else {
        await courseAPI.create(coursePayload);
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

  const canSubmit = courseData.title && courseData.description && courseData.duration && courseData.modules.length > 0;

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-gray-500 mb-1">
            Course Forge
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[0.16em] uppercase flex items-center gap-3">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
            <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-transparent" />
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
        <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
          <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
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
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600' 
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
            <textarea
              required
              rows={3}
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              placeholder="Describe what students will learn in this course..."
            />
          </div>
        </div>

        {/* Current Module Builder */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
          <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4 flex items-center justify-between gap-3">
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
            <div className="border-t border-gray-200 pt-4 mt-2">
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
                    className="px-3 py-2 text-[11px] rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {currentModule.videos.length > 0 && (
                <div className="space-y-2">
                  {currentModule.videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {video.title}
                        </p>
                        <p className="text-[11px] text-gray-600 break-all">
                          {video.url} • {video.duration || 'No duration'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                        className="text-red-500 hover:text-red-600 text-[11px] transition-colors"
                      >
                        Remove
                      </button>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 mt-3">
                <input
                  type="text"
                  value={currentFile.title}
                  onChange={(e) =>
                    setCurrentFile({ ...currentFile, title: e.target.value })
                  }
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="File title"
                />
                <input
                  type="text"
                  value={currentFile.url}
                  onChange={(e) => setCurrentFile({ ...currentFile, url: e.target.value })}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="File URL"
                />
                <div className="flex gap-2">
                  <select
                    value={currentFile.type}
                    onChange={(e) =>
                      setCurrentFile({ ...currentFile, type: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                  >
                    <option value="pdf">PDF</option>
                    <option value="doc">Document</option>
                    <option value="ppt">Presentation</option>
                    <option value="zip">Archive</option>
                  </select>
                  <button
                    type="button"
                    onClick={addFile}
                    className="px-3 py-2 text-[11px] rounded-lg bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-300 transition-all duration-200"
                  >
                    Add
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
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
            <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
              Course Modules ({courseData.modules.length})
            </h2>

            <div className="mt-4 space-y-3">
              {courseData.modules.map((module, index) => (
                <div key={module.id} className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 transition-all duration-200">
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
                      Edit
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
              ))}
            </div>
          </div>
        )}

        {/* Submit Row */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="flex-1 justify-center py-3 text-xs md:text-sm rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-cyan-500/30"
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