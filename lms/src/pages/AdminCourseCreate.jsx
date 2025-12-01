// import React, { useState, useEffect } from 'react';
// import { courseAPI, adminAPI } from '../services/api';

// const AdminCourseCreate = ({ course, onBack, onSuccess }) => {
//   const [loading, setLoading] = useState(false);
//   const [courseData, setCourseData] = useState({
//     title: '',
//     description: '',
//     category: 'Development',
//     level: 'Beginner',
//     duration: '',
//     image: '📚',
//     isPublished: false,
//     modules: []
//   });

//   useEffect(() => {
//     if (course) {
//       // Populate form with existing course data
//       setCourseData({
//         title: course.title || '',
//         description: course.description || '',
//         category: course.category || 'Development',
//         level: course.level || 'Beginner',
//         duration: course.duration || '',
//         image: course.image || '📚',
//         isPublished: course.isPublished || false,
//         modules: course.lessons ? course.lessons.map(lesson => ({
//           title: lesson.title || '',
//           description: lesson.description || '',
//           videos: lesson.videoUrl ? [{
//             id: Date.now(),
//             title: lesson.title,
//             url: lesson.videoUrl,
//             duration: lesson.duration || ''
//           }] : [],
//           files: lesson.resources || [],
//           quiz: null,
//           assignment: null
//         })) : []
//       });
//     }
//   }, [course]);

//   const [currentModule, setCurrentModule] = useState({
//     title: '',
//     description: '',
//     videos: [],
//     files: [],
//     quiz: null,
//     assignment: null
//   });

//   const [currentVideo, setCurrentVideo] = useState({
//     title: '',
//     url: '',
//     duration: ''
//   });

//   const [currentFile, setCurrentFile] = useState({
//     title: '',
//     url: '',
//     type: 'pdf'
//   });

//   const addVideo = () => {
//     if (currentVideo.title && currentVideo.url) {
//       setCurrentModule({
//         ...currentModule,
//         videos: [...currentModule.videos, { ...currentVideo, id: Date.now() }]
//       });
//       setCurrentVideo({ title: '', url: '', duration: '' });
//     }
//   };

//   const removeVideo = (videoId) => {
//     setCurrentModule({
//       ...currentModule,
//       videos: currentModule.videos.filter(v => v.id !== videoId)
//     });
//   };

//   const addFile = () => {
//     if (currentFile.title && currentFile.url) {
//       setCurrentModule({
//         ...currentModule,
//         files: [...currentModule.files, { ...currentFile, id: Date.now() }]
//       });
//       setCurrentFile({ title: '', url: '', type: 'pdf' });
//     }
//   };

//   const removeFile = (fileId) => {
//     setCurrentModule({
//       ...currentModule,
//       files: currentModule.files.filter(f => f.id !== fileId)
//     });
//   };

//   const addModule = () => {
//     if (currentModule.title) {
//       setCourseData({
//         ...courseData,
//         modules: [...courseData.modules, { ...currentModule, id: Date.now() }]
//       });
//       setCurrentModule({
//         title: '',
//         description: '',
//         videos: [],
//         files: [],
//         quiz: null,
//         assignment: null
//       });
//     }
//   };

//   const removeModule = (moduleId) => {
//     setCourseData({
//       ...courseData,
//       modules: courseData.modules.filter(m => m.id !== moduleId)
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Convert modules structure for backend
//       const lessons = courseData.modules.flatMap((module, moduleIndex) => 
//         module.videos.map((video, videoIndex) => ({
//           title: video.title,
//           description: `Module ${moduleIndex + 1}: ${module.title}`,
//           videoUrl: video.url,
//           duration: video.duration,
//           order: moduleIndex * 100 + videoIndex,
//           resources: module.files.map(file => ({
//             title: file.title,
//             url: file.url,
//             type: file.type
//           }))
//         }))
//       );

//       const coursePayload = {
//         title: courseData.title,
//         description: courseData.description,
//         category: courseData.category,
//         level: courseData.level,
//         duration: courseData.duration,
//         image: courseData.image,
//         isPublished: courseData.isPublished,
//         lessons: lessons
//       };

//       if (course && course._id) {
//         // Update existing course
//         await adminAPI.updateCourse(course._id, coursePayload);
//         alert('Course updated successfully!');
//       } else {
//         // Create new course
//         await courseAPI.create(coursePayload);
//         alert('Course created successfully!');
//       }
      
//       if (onSuccess) onSuccess();
//     } catch (error) {
//       console.error('Error saving course:', error);
//       alert('Failed to save course: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-900">
//           {course ? 'Edit Course' : 'Create New Course'}
//         </h1>
//         <button
//           onClick={onBack}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//         >
//           ← Back
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Course Basic Info */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h2 className="text-xl font-semibold mb-4">Course Information</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Course Title *
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={courseData.title}
//                 onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 placeholder="e.g., Complete Web Development"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Duration *
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={courseData.duration}
//                 onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 placeholder="e.g., 8 weeks"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Category *
//               </label>
//               <select
//                 value={courseData.category}
//                 onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="Development">Development</option>
//                 <option value="Data Science">Data Science</option>
//                 <option value="Design">Design</option>
//                 <option value="Marketing">Marketing</option>
//                 <option value="Business">Business</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Level *
//               </label>
//               <select
//                 value={courseData.level}
//                 onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="Beginner">Beginner</option>
//                 <option value="Intermediate">Intermediate</option>
//                 <option value="Advanced">Advanced</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Icon
//               </label>
//               <input
//                 type="text"
//                 value={courseData.image}
//                 onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 placeholder="e.g., 📚"
//               />
//             </div>

//             <div className="flex items-center">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={courseData.isPublished}
//                   onChange={(e) => setCourseData({ ...courseData, isPublished: e.target.checked })}
//                   className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
//                 />
//                 <span className="text-sm font-medium text-gray-700">Publish Course</span>
//               </label>
//             </div>
//           </div>

//           <div className="mt-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Description *
//             </label>
//             <textarea
//               required
//               rows="3"
//               value={courseData.description}
//               onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               placeholder="Describe what students will learn in this course..."
//             />
//           </div>
//         </div>

//         {/* Current Module */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h2 className="text-xl font-semibold mb-4">Add Module</h2>
          
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Module Title
//               </label>
//               <input
//                 type="text"
//                 value={currentModule.title}
//                 onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 placeholder="e.g., Introduction to JavaScript"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Module Description
//               </label>
//               <textarea
//                 rows="2"
//                 value={currentModule.description}
//                 onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                 placeholder="Describe this module..."
//               />
//             </div>

//             {/* Videos Section */}
//             <div className="border-t pt-4">
//               <h3 className="text-lg font-semibold mb-3">Videos</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
//                 <input
//                   type="text"
//                   value={currentVideo.title}
//                   onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="Video title"
//                 />
//                 <input
//                   type="text"
//                   value={currentVideo.url}
//                   onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="Video URL"
//                 />
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={currentVideo.duration}
//                     onChange={(e) => setCurrentVideo({ ...currentVideo, duration: e.target.value })}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                     placeholder="Duration"
//                   />
//                   <button
//                     type="button"
//                     onClick={addVideo}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                   >
//                     Add
//                   </button>
//                 </div>
//               </div>

//               {currentModule.videos.length > 0 && (
//                 <div className="space-y-2">
//                   {currentModule.videos.map((video) => (
//                     <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-sm">{video.title}</p>
//                         <p className="text-xs text-gray-600">{video.url} • {video.duration}</p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeVideo(video.id)}
//                         className="text-red-600 hover:text-red-800 text-sm"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Files Section */}
//             <div className="border-t pt-4">
//               <h3 className="text-lg font-semibold mb-3">Files & Resources</h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
//                 <input
//                   type="text"
//                   value={currentFile.title}
//                   onChange={(e) => setCurrentFile({ ...currentFile, title: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="File title"
//                 />
//                 <input
//                   type="text"
//                   value={currentFile.url}
//                   onChange={(e) => setCurrentFile({ ...currentFile, url: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="File URL"
//                 />
//                 <div className="flex gap-2">
//                   <select
//                     value={currentFile.type}
//                     onChange={(e) => setCurrentFile({ ...currentFile, type: e.target.value })}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="pdf">PDF</option>
//                     <option value="doc">Document</option>
//                     <option value="ppt">Presentation</option>
//                     <option value="zip">Archive</option>
//                   </select>
//                   <button
//                     type="button"
//                     onClick={addFile}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                   >
//                     Add
//                   </button>
//                 </div>
//               </div>

//               {currentModule.files.length > 0 && (
//                 <div className="space-y-2">
//                   {currentModule.files.map((file) => (
//                     <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-sm">{file.title}</p>
//                         <p className="text-xs text-gray-600">{file.type.toUpperCase()} • {file.url}</p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeFile(file.id)}
//                         className="text-red-600 hover:text-red-800 text-sm"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={addModule}
//               disabled={!currentModule.title}
//               className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Add Module to Course
//             </button>
//           </div>
//         </div>

//         {/* Added Modules */}
//         {courseData.modules.length > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h2 className="text-xl font-semibold mb-4">Course Modules ({courseData.modules.length})</h2>
            
//             <div className="space-y-3">
//               {courseData.modules.map((module, index) => (
//                 <div key={module.id} className="border border-gray-200 rounded-lg p-4">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-lg">Module {index + 1}: {module.title}</h3>
//                       <p className="text-sm text-gray-600 mt-1">{module.description}</p>
//                       <div className="flex gap-4 mt-2 text-sm text-gray-500">
//                         <span>📹 {module.videos.length} videos</span>
//                         <span>📄 {module.files.length} files</span>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => removeModule(module.id)}
//                       className="text-red-600 hover:text-red-800 text-sm font-medium"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Submit Button */}
//         <div className="flex gap-4">
//           <button
//             type="submit"
//             disabled={loading || !courseData.title || courseData.modules.length === 0}
//             className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//           >
//             {loading ? 'Creating Course...' : 'Create Course'}
//           </button>
//           <button
//             type="button"
//             onClick={onBack}
//             className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AdminCourseCreate;


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

  const isEditMode = !!(course && course._id);

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
        modules: course.lessons
          ? course.lessons.map((lesson) => ({
              id: Date.now() + Math.random(),
              title: lesson.title || '',
              description: lesson.description || '',
              videos: lesson.videoUrl
                ? [
                    {
                      id: Date.now() + Math.random(),
                      title: lesson.title,
                      url: lesson.videoUrl,
                      duration: lesson.duration || ''
                    }
                  ]
                : [],
              files: (lesson.resources || []).map((r) => ({
                ...r,
                id: Date.now() + Math.random()
              })),
              quiz: null,
              assignment: null
            }))
          : []
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
      setCourseData((prev) => ({
        ...prev,
        modules: [...prev.modules, { ...currentModule, id: Date.now() }]
      }));
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-sky-300/80 mb-1">
            Course Forge
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-50 tracking-[0.16em] uppercase flex items-center gap-3">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
            <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-transparent shadow-[0_0_16px_rgba(56,189,248,0.9)]" />
          </h1>
        </div>

        <button type="button" onClick={onBack} className="neo-secondary-btn hidden sm:inline-flex items-center gap-2">
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* Course Basic Info */}
        <div className="neo-card">
          <h2 className="neo-section-title">Course Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-4">
            <div>
              <label className="neo-field-label">Course Title *</label>
              <input
                type="text"
                required
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                className="neo-input w-full"
                placeholder="e.g., Complete Web Development"
              />
            </div>

            <div>
              <label className="neo-field-label">Duration *</label>
              <input
                type="text"
                required
                value={courseData.duration}
                onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                className="neo-input w-full"
                placeholder="e.g., 8 weeks"
              />
            </div>

            <div>
              <label className="neo-field-label">Category *</label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                className="neo-select w-full"
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
              <label className="neo-field-label">Level *</label>
              <select
                value={courseData.level}
                onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                className="neo-select w-full"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="neo-field-label">Icon</label>
              <input
                type="text"
                value={courseData.image}
                onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                className="neo-input w-full"
                placeholder="e.g., 📚"
              />
            </div>

            <div className="flex items-center mt-2">
              <div className="flex items-center gap-3">
                <span className="neo-field-label">Publish</span>
                <button
                  type="button"
                  onClick={() =>
                    setCourseData((prev) => ({ ...prev, isPublished: !prev.isPublished }))
                  }
                  className={`neo-publish-toggle ${
                    courseData.isPublished ? 'neo-publish-on' : 'neo-publish-off'
                  }`}
                >
                  <span className="neo-publish-dot" />
                  <span className="neo-publish-label">
                    {courseData.isPublished ? 'Live' : 'Draft'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="neo-field-label">Description *</label>
            <textarea
              required
              rows={3}
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              className="neo-textarea w-full"
              placeholder="Describe what students will learn in this course..."
            />
          </div>
        </div>

        {/* Current Module Builder */}
        <div className="neo-card">
          <h2 className="neo-section-title flex items-center justify-between gap-3">
            Module Builder
            <span className="text-[10px] md:text-xs text-sky-300/80 tracking-[0.18em] uppercase">
              Stage {courseData.modules.length + 1}
            </span>
          </h2>

          <div className="space-y-4 mt-4">
            <div>
              <label className="neo-field-label">Module Title</label>
              <input
                type="text"
                value={currentModule.title}
                onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                className="neo-input w-full"
                placeholder="e.g., Introduction to JavaScript"
              />
            </div>

            <div>
              <label className="neo-field-label">Module Description</label>
              <textarea
                rows={2}
                value={currentModule.description}
                onChange={(e) =>
                  setCurrentModule({ ...currentModule, description: e.target.value })
                }
                className="neo-textarea w-full"
                placeholder="Describe this module..."
              />
            </div>

            {/* Videos */}
            <div className="border-t border-slate-700/60 pt-4 mt-2">
              <h3 className="neo-subsection-title">Videos</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 mt-3">
                <input
                  type="text"
                  value={currentVideo.title}
                  onChange={(e) =>
                    setCurrentVideo({ ...currentVideo, title: e.target.value })
                  }
                  className="neo-input"
                  placeholder="Video title"
                />
                <input
                  type="text"
                  value={currentVideo.url}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                  className="neo-input"
                  placeholder="Video URL"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentVideo.duration}
                    onChange={(e) =>
                      setCurrentVideo({ ...currentVideo, duration: e.target.value })
                    }
                    className="neo-input flex-1"
                    placeholder="Duration"
                  />
                  <button
                    type="button"
                    onClick={addVideo}
                    className="neo-btn neo-btn-active px-3 py-2 text-[11px]"
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
                      className="neo-mini-row flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-50">
                          {video.title}
                        </p>
                        <p className="text-[11px] text-slate-400 break-all">
                          {video.url} • {video.duration || 'No duration'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                        className="neo-action-btn text-red-400 hover:text-red-300 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="border-t border-slate-700/60 pt-4 mt-2">
              <h3 className="neo-subsection-title">Files & Resources</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 mt-3">
                <input
                  type="text"
                  value={currentFile.title}
                  onChange={(e) =>
                    setCurrentFile({ ...currentFile, title: e.target.value })
                  }
                  className="neo-input"
                  placeholder="File title"
                />
                <input
                  type="text"
                  value={currentFile.url}
                  onChange={(e) => setCurrentFile({ ...currentFile, url: e.target.value })}
                  className="neo-input"
                  placeholder="File URL"
                />
                <div className="flex gap-2">
                  <select
                    value={currentFile.type}
                    onChange={(e) =>
                      setCurrentFile({ ...currentFile, type: e.target.value })
                    }
                    className="neo-select flex-1"
                  >
                    <option value="pdf">PDF</option>
                    <option value="doc">Document</option>
                    <option value="ppt">Presentation</option>
                    <option value="zip">Archive</option>
                  </select>
                  <button
                    type="button"
                    onClick={addFile}
                    className="neo-btn neo-btn-idle px-3 py-2 text-[11px]"
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
                      className="neo-mini-row flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-50">
                          {file.title}
                        </p>
                        <p className="text-[11px] text-slate-400 break-all">
                          {file.type.toUpperCase()} • {file.url}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="neo-action-btn text-red-400 hover:text-red-300 text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addModule}
              disabled={!currentModule.title}
              className="neo-secondary-btn w-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Module to Course
            </button>
          </div>
        </div>

        {/* Added Modules */}
        {courseData.modules.length > 0 && (
          <div className="neo-card">
            <h2 className="neo-section-title">
              Course Modules ({courseData.modules.length})
            </h2>

            <div className="mt-4 space-y-3">
              {courseData.modules.map((module, index) => (
                <div key={module.id} className="neo-mini-row">
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-semibold text-slate-50">
                      Module {index + 1}: {module.title}
                    </p>
                    {module.description && (
                      <p className="text-xs text-slate-400 mt-1">
                        {module.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-slate-400">
                      <span>📹 {module.videos.length} videos</span>
                      <span>📄 {module.files.length} files</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(module.id)}
                    className="neo-action-btn text-red-400 hover:text-red-300 text-[11px]"
                  >
                    Remove
                  </button>
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
            className="neo-btn neo-btn-active flex-1 justify-center py-3 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="neo-secondary-btn px-6 py-3 text-xs md:text-sm flex items-center justify-center gap-2"
          >
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseCreate;
