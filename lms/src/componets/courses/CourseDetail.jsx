import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress'; 

const CourseDetail = ({ course, onBack, onLessonSelect, onEnroll, enrolling, enrollment, completedLessons = [], allLessons = [] }) => {
  const [activeTab, setActiveTab] = useState('curriculum');
  const [expandedModules, setExpandedModules] = useState(new Set());
  const courseId = course?._id || course?.id;
  const { progress, loading: progressLoading } = useProgress(courseId);
  const [showFullDescription, setShowFullDescription] = useState(false);


  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };
  
  // Use enrollment progress if available, otherwise use hook progress
  const displayProgress = enrollment?.progress !== undefined ? enrollment.progress : progress;

  // Safe course props
  const courseTitle = course?.title || 'Course';
  const courseInstructor =
    course?.instructor?.name ||
    course?.instructorName ||
    course?.instructor ||
    'Instructor';
  const courseDescription = course?.description || 'No description available';
  const courseLevel = course?.level || 'Beginner';
  const courseDuration = course?.duration || 'N/A';
  const courseImage = course?.image || '📚';
  const courseRating = course?.rating || 4.5;
  const courseCategory = course?.category || 'General';
  const courseStudents = course?.enrolledStudents || course?.students || 0;

  // Modules - Support both lessons array from backend and modules structure
  const modules = (() => {
    if (course.lessons && Array.isArray(course.lessons) && course.lessons.length > 0) {
      // Group lessons by moduleId - each lesson should have moduleId and moduleName
      const moduleMap = new Map();
      
      course.lessons.forEach((lesson, idx) => {
        const lessonId = lesson._id || lesson.id;
        const isCompleted = completedLessons.includes(lessonId) || 
                           completedLessons.some(id => id?.toString() === lessonId?.toString());
        
        // Use moduleId from lesson, or create a default one
        const moduleId = lesson.moduleId || 'default-module-0';
        const moduleName = lesson.moduleName || `Module 1`;
        
        // Initialize module if it doesn't exist
        if (!moduleMap.has(moduleId)) {
          moduleMap.set(moduleId, {
            id: moduleId,
            title: moduleName,
            duration: 'Self-paced',
            lessons: []
          });
        }
        
        moduleMap.get(moduleId).lessons.push({
          id: lessonId || idx + 1,
          _id: lessonId,
          title: lesson.title || `Lesson ${idx + 1}`,
          duration: lesson.duration || '10 min',
          type: 'video',
          completed: isCompleted,
          url: lesson.videoUrl,
          description: lesson.description,
        });
      });
      
      // Convert map to array and calculate module durations
      return Array.from(moduleMap.values()).map(module => {
        const totalMinutes = module.lessons.reduce((sum, lesson) => {
          const duration = lesson.duration || '10 min';
          const match = duration.match(/(\d+)/);
          return sum + (match ? parseInt(match[1]) : 10);
        }, 0);
        return {
          ...module,
          duration: totalMinutes > 60 
            ? `${Math.floor(totalMinutes / 60)} hour${Math.floor(totalMinutes / 60) > 1 ? 's' : ''} ${totalMinutes % 60} min`
            : `${totalMinutes} min`
        };
      });
    } else if (course.modules && Array.isArray(course.modules) && course.modules.length > 0) {
      // Modules format - extract videos from resources/videos
      return course.modules.map((mod, idx) => {
        const moduleLessons = [];
        
        // Check if module has videos array
        if (mod.videos && Array.isArray(mod.videos) && mod.videos.length > 0) {
          mod.videos.forEach((video, videoIdx) => {
            const videoId = video._id || video.id || videoIdx + 1;
            const isCompleted = completedLessons.includes(videoId) || 
                               completedLessons.some(id => id?.toString() === videoId?.toString());
            moduleLessons.push({
              id: videoId,
              _id: video._id || video.id,
              title: video.title || `Video ${videoIdx + 1}`,
              duration: video.duration || '10 min',
              type: 'video',
              completed: isCompleted,
              url: video.url || video.videoUrl,
              description: video.description,
            });
          });
        }
        
        // Also check resources if videos array is empty
        if (moduleLessons.length === 0 && mod.resources && Array.isArray(mod.resources)) {
          mod.resources.forEach((res, resIdx) => {
            const resId = res._id || res.id || resIdx + 1;
            const isCompleted = completedLessons.includes(resId) || 
                               completedLessons.some(id => id?.toString() === resId?.toString());
            moduleLessons.push({
              id: resId,
              _id: res._id || res.id,
              title: res.title || `Lesson ${resIdx + 1}`,
              duration: res.duration || '10 min',
              type: res.type || 'video',
              completed: isCompleted,
              url: res.url || res.videoUrl,
              description: res.description,
            });
          });
        }
        
        return {
          id: mod._id || idx + 1,
          title: mod.title || `Module ${idx + 1}`,
          duration: mod.duration || '1 hour',
          lessons: moduleLessons,
        };
      });
    } else {
      // Default fallback
      return [
        {
          id: 1,
          title: 'Introduction',
          duration: '45 min',
          lessons: [
            {
              id: 1,
              title: 'Welcome to the Course',
              duration: '5 min',
              type: 'video',
              completed: false,
            },
            {
              id: 2,
              title: 'Course Overview',
              duration: '10 min',
              type: 'video',
              completed: false,
            },
          ],
        },
      ];
    }
  })();

  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const completedLessonsCount = modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => lesson.completed).length,
    0
  );

  const instructors = [
    {
      name: courseInstructor,
      role: 'Senior Web Developer',
      bio: '10+ years of experience in web development. Former lead developer at TechCorp.',
      image: '👩‍💻',
    },
  ];

  const tabs = [
    { id: 'curriculum', label: 'Curriculum' },
    // { id: 'overview', label: 'Overview' },
    // { id: 'instructor', label: 'Instructor' },
    // { id: 'reviews', label: 'Reviews' },
    // { id: 'resources', label: 'Resources' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* TOP HUD CARD */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="p-4 md:p-6 pb-3 md:pb-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[10px] md:text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-200"
            >
              <span>←</span>
              <span>Back to Courses</span>
            </button>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Course Progress
              </p>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {displayProgress}%
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-lime-500 via-cyan-500 to-[#99DBFF] shadow-[0_0_10px_rgba(0,195,221,0.4)]"
                  style={{ width: `${Math.min(displayProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
  {/* Left Content */}
  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 flex-1">
    {/* Course Icon / Image */}
    <div className="text-4xl sm:text-5xl md:text-6xl shrink-0">
      {courseImage}
    </div>

    {/* Text Content */}
    <div className="space-y-3 w-full">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[0.08em]">
        {courseTitle}
      </h1>

      <p className="text-xs sm:text-sm text-gray-600">
        {courseInstructor}
      </p>

      {/* Description with See More */}
{/* Description with inline See More */}
<div className="relative">
  <div
    className={`text-sm md:text-[15px] text-gray-700 prose prose-sm max-w-none break-words
      ${!showFullDescription ? "line-clamp-4" : ""}`}
    dangerouslySetInnerHTML={{ __html: courseDescription }}
  />

  {!showFullDescription && (
    <button
      onClick={() => setShowFullDescription(true)}
      className="absolute bottom-0 right-0 bg-white pl-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
    >
      … See more
    </button>
  )}

  {showFullDescription && (
    <button
      onClick={() => setShowFullDescription(false)}
      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
    >
      See less
    </button>
  )}
</div>



      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[11px] sm:text-xs text-gray-600">
        <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
          {courseLevel} Level
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white text-gray-900 border border-gray-300">
          {courseCategory}
        </span>
        <span className="flex items-center gap-1">
          ⏱️ <span>{courseDuration}</span>
        </span>
        <span className="flex items-center gap-1">
          🎯 <span>{totalLessons} Lessons</span>
        </span>
      </div>
    </div>
  </div>

  {/* Progress HUD */}
  <div className="flex lg:flex-col items-center justify-center gap-3 lg:gap-2 self-start lg:self-auto">
    <div className="relative inline-block">
      <svg className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="3"
          strokeDasharray={`${displayProgress}, 100`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm sm:text-base md:text-lg font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {displayProgress}%
        </span>
      </div>
    </div>

    <p className="text-[10px] sm:text-xs text-gray-500 text-center">
      {completedLessonsCount} / {totalLessons} lessons
    </p>
  </div>
</div>

        </div>

        {/* TABS */}
        <div className="border-t border-gray-200 px-4 md:px-6 py-3 flex flex-wrap gap-2 bg-gray-50/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-[10px] md:text-xs rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT: TABS CONTENT */}
        <div className="lg:col-span-3 space-y-6">
          {/* CURRICULUM */}
          {activeTab === 'curriculum' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h1 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase">
                  Course Content
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  {completedLessonsCount} of {totalLessons} lessons completed ({displayProgress}
                  %)
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {modules.map((module, moduleIndex) => {
                  const isExpanded = expandedModules.has(module.id);
                  const completedCount = module.lessons.filter((lesson) => lesson.completed).length;
                  
                  return (
                    <div key={module.id} className="border-b border-gray-200 last:border-b-0">
                      {/* Module Header - Clickable to expand/collapse */}
                      <div 
                        onClick={() => toggleModule(module.id)}
                        className="p-5 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button className="text-gray-500 hover:text-gray-700 transition-transform duration-200">
                              {isExpanded ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1">
                              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                {module.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'} • {module.duration}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500 ml-4">
                            <span className="font-medium">
                              {completedCount}/{module.lessons.length}
                            </span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full transition-all duration-300"
                                style={{ width: `${module.lessons.length > 0 ? (completedCount / module.lessons.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Videos List - Collapsible */}
                      {isExpanded && (
                        <div className="px-5 pb-5 bg-gray-50/50">
                          <div className="space-y-2 pt-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onLessonSelect && onLessonSelect(lesson);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white border ${
                                  lesson.completed
                                    ? 'border-lime-300 bg-lime-50/50'
                                    : 'border-gray-200 bg-white hover:shadow-sm'
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                    lesson.completed
                                      ? 'bg-gradient-to-r from-lime-500 to-lime-400 text-white shadow-md shadow-lime-500/30'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {lesson.completed ? '✓' : lessonIndex + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {lesson.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <span>
                                        {lesson.type === 'video'
                                          ? '🎥'
                                          : lesson.type === 'quiz'
                                          ? '🧠'
                                          : lesson.type === 'assignment'
                                          ? '📝'
                                          : '📄'}
                                      </span>
                                      <span className="capitalize">
                                        {lesson.type}
                                      </span>
                                    </span>
                                    <span>•</span>
                                    <span>{lesson.duration}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLessonSelect && onLessonSelect(lesson);
                                  }}
                                  className={`px-3 py-1 text-[10px] rounded-lg transition-all duration-200 flex-shrink-0 ${
                                    lesson.completed
                                      ? 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-300'
                                      : 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40'
                                  }`}
                                >
                                  {lesson.completed ? 'Review' : 'Start'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
                Course Overview
              </h2>
              <div className="space-y-6 text-sm text-gray-700">
                <p>
                  This comprehensive course will take you from beginner to
                  proficient in web development fundamentals. You'll learn the
                  core technologies that power the modern web.
                </p>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 tracking-[0.16em] uppercase mb-3">
                    What You&apos;ll Learn
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'HTML5 semantic markup and structure',
                      'CSS3 styling and layout techniques',
                      'Responsive web design principles',
                      'JavaScript fundamentals',
                      'DOM manipulation',
                      'Basic web development workflow',
                      'Debugging and problem-solving',
                      'Best practices and standards',
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <span className="text-lime-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 tracking-[0.16em] uppercase mb-2">
                    Prerequisites
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Basic computer skills</li>
                    <li>No prior programming experience required</li>
                    <li>Access to a computer with internet connection</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 tracking-[0.16em] uppercase mb-2">
                    Who This Course Is For
                  </h3>
                  <p className="text-gray-700">
                    This course is perfect for complete beginners who want to
                    start their journey in web development, as well as
                    professionals from other fields looking to transition into
                    tech.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTOR */}
          {activeTab === 'instructor' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-6">
                Meet Your Instructor
              </h2>
              <div className="space-y-6">
                {instructors.map((instructor, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-start gap-6"
                  >
                    <div className="text-5xl">{instructor.image}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {instructor.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {instructor.role}
                      </p>
                      <p className="text-sm text-gray-700 mt-3">
                        {instructor.bio}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            4.8
                          </div>
                          <div className="text-xs text-gray-500">
                            Instructor Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            12,450
                          </div>
                          <div className="text-xs text-gray-500">
                            Students
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">8</div>
                          <div className="text-xs text-gray-500">Courses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-6">
                Student Reviews
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">4.8</div>
                  <div className="flex justify-center mt-2 text-yellow-500">
                    {'★'.repeat(5)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Course Rating
                  </div>
                </div>
                <div className="col-span-2 space-y-2 text-xs">
                  {[
                    { stars: 5, percentage: 75 },
                    { stars: 4, percentage: 20 },
                    { stars: 3, percentage: 4 },
                    { stars: 2, percentage: 1 },
                    { stars: 1, percentage: 0 },
                  ].map((rating, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex w-16">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < rating.stars
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-yellow-500 rounded-full"
                          style={{ width: `${rating.percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-500 w-8">
                        {rating.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 text-sm text-gray-700">
                {[
                  {
                    name: 'Alex Johnson',
                    rating: 5,
                    date: '2 weeks ago',
                    comment:
                      'Excellent course! The instructor explains complex concepts in a very understandable way. Perfect for beginners.',
                    avatar: '👤',
                  },
                  {
                    name: 'Sarah Miller',
                    rating: 5,
                    date: '1 month ago',
                    comment:
                      'Loved the hands-on projects. The step-by-step approach made learning web development much less intimidating.',
                    avatar: '👤',
                  },
                  {
                    name: 'Mike Chen',
                    rating: 4,
                    date: '2 months ago',
                    comment:
                      'Great content and delivery. Would love to see more advanced topics covered in future updates.',
                    avatar: '👤',
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.avatar}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < review.rating
                                      ? 'text-yellow-500'
                                      : 'text-gray-300'
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESOURCES */}
          {activeTab === 'resources' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-6">
                Course Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Course Slides PDF',
                    description: 'Download all presentation slides from the course',
                    type: 'pdf',
                    size: '2.4 MB',
                  },
                  {
                    title: 'Code Examples',
                    description:
                      'All source code used in the course demonstrations',
                    type: 'zip',
                    size: '1.8 MB',
                  },
                  {
                    title: 'Cheat Sheets',
                    description:
                      'Quick reference guides for HTML, CSS, and JavaScript',
                    type: 'pdf',
                    size: '1.2 MB',
                  },
                  {
                    title: 'Project Files',
                    description: 'Starter files and completed projects',
                    type: 'zip',
                    size: '3.5 MB',
                  },
                ].map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {resource.type === 'pdf' ? '📄' : '📦'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {resource.description}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-2">
                          {resource.size}
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-[10px] rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR CARDS */}
        <div className="space-y-5">
          {/* Enroll Button */}
          {enrollment ? (
            <button
              disabled
              className="w-full py-4 text-base font-semibold justify-center rounded-xl bg-gray-400 text-white shadow-lg cursor-not-allowed opacity-75 flex items-center gap-2"
            >
              ✓ Already Enrolled
            </button>
          ) : (
            <button
              onClick={() => onEnroll && onEnroll(course._id)}
              disabled={enrolling}
              className={`w-full py-4 text-base font-semibold justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 ${
                enrolling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}

          {/* Progress Card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
              Your Progress
            </h3>
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-28 h-28" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${displayProgress}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {displayProgress}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedLessonsCount} of {totalLessons} lessons completed
              </p>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
              Course Info
            </h3>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{courseDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lessons</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Level</span>
                <span className="font-medium">{courseLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{courseCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">Jan 2025</span>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
              Certificate
            </h3>
            <div className="text-center text-sm text-gray-700">
              <div className="text-4xl mb-3">🏆</div>
              <p className="mb-4">
                Complete all lessons and assignments to unlock your course
                certificate.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full shadow-md shadow-yellow-500/30"
                  style={{ width: `${Math.min(displayProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {progress}% towards certificate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;