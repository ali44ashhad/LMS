import React, { useState } from 'react';
import { useProgress } from '../../hooks/useProgress'; 

const CourseDetail = ({ course, onBack, onLessonSelect, onEnroll, enrolling }) => {
  const [activeTab, setActiveTab] = useState('curriculum');
  const { progress } = useProgress(course.id);

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
      // Backend sends flat lessons array - group them by title prefix or create single module
      return [{
        id: 1,
        title: 'Course Content',
        duration: 'Self-paced',
        lessons: course.lessons.map((lesson, idx) => ({
          id: lesson._id || idx + 1,
          title: lesson.title || `Lesson ${idx + 1}`,
          duration: lesson.duration || '10 min',
          type: 'video',
          completed: false,
          url: lesson.videoUrl,
          description: lesson.description,
        }))
      }];
    } else if (course.modules && Array.isArray(course.modules) && course.modules.length > 0) {
      // Old format - modules with resources
      return course.modules.map((mod, idx) => ({
        id: mod._id || idx + 1,
        title: mod.title || `Module ${idx + 1}`,
        duration: mod.duration || '1 hour',
        lessons:
          mod.resources && Array.isArray(mod.resources)
            ? mod.resources.map((res, resIdx) => ({
                id: res._id || resIdx + 1,
                title: res.title || `Lesson ${resIdx + 1}`,
                duration: res.duration || '10 min',
                type: res.type || 'video',
                completed: false,
              }))
            : [],
      }));
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
  const completedLessons = modules.reduce(
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
    { id: 'overview', label: 'Overview' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'resources', label: 'Resources' },
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
              <div className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {progress}%
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-lime-500 via-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(0,195,221,0.4)]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4 md:gap-6 flex-1">
              <div className="text-5xl md:text-6xl">{courseImage}</div>
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-[0.08em]">
                  {courseTitle}
                </h1>
                <p className="text-sm text-gray-600">{courseInstructor}</p>
                <p className="text-sm md:text-[15px] text-gray-700 max-w-2xl">
                  {courseDescription}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-600">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
                    {courseLevel} Level
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    {courseCategory}
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ <span>{courseDuration}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    🎯 <span>{totalLessons} Lessons</span>
                  </span>
                  <span className="flex items-center gap-1">
                    ⭐
                    <span>
                      {courseRating} ({courseStudents} students)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Progress HUD */}
            <div className="hidden lg:flex flex-col items-center justify-center">
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
                    stroke="url(#grad)"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
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
                  <span className="text-lg font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {progress}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedLessons} / {totalLessons} lessons
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
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20'
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
                <h1 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase">
                  Course Content
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  {completedLessons} of {totalLessons} lessons completed ({progress}
                  %)
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {moduleIndex + 1}. {module.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {module.lessons.length} lessons • {module.duration}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <span>
                          {
                            module.lessons.filter((lesson) => lesson.completed)
                              .length
                          }
                          /{module.lessons.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          onClick={() =>
                            onLessonSelect && onLessonSelect(lesson)
                          }
                          className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white border ${
                            lesson.completed
                              ? 'border-lime-300 bg-lime-50'
                              : 'border-gray-300 bg-white hover:shadow-sm'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                              lesson.completed
                                ? 'bg-gradient-to-r from-lime-500 to-lime-400 text-white shadow-md shadow-lime-500/30'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {lesson.completed ? '✓' : lessonIndex + 1}
                          </div>

                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {lesson.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-600">
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
                            className={`px-3 py-1 text-[10px] rounded-lg transition-all duration-200 ${
                              lesson.completed
                                ? 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-300'
                                : 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40'
                            }`}
                          >
                            {lesson.completed ? 'Review' : 'Start'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
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
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-6">
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
                          <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            4.8
                          </div>
                          <div className="text-xs text-gray-500">
                            Instructor Rating
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            12,450
                          </div>
                          <div className="text-xs text-gray-500">
                            Students
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">8</div>
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
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-6">
                Student Reviews
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">4.8</div>
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
              <h2 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-6">
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
                    <button className="px-3 py-1 text-[10px] rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200">
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
          {!course?.enrolled && (
            <button
              onClick={() => onEnroll && onEnroll(course._id)}
              className="w-full py-4 text-base font-semibold justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
            >
              Enroll Now
            </button>
          )}

          {/* Progress Card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
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
                    strokeDasharray={`${progress}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-lime-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {progress}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6">
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
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
            <h3 className="text-sm font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-[0.16em] uppercase mb-4">
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
                  style={{ width: `${Math.min(progress, 100)}%` }}
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