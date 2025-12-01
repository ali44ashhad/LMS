// // src/components/courses/CourseCard.jsx
// import React from 'react';

// const CourseCard = ({ course, onSelect }) => {
//   const getProgressColor = (progress) => {
//     if (progress >= 75) return 'bg-green-500';
//     if (progress >= 50) return 'bg-blue-500';
//     if (progress >= 25) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not accessed yet';
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return 'Yesterday';
//     if (diffDays < 7) return `${diffDays} days ago`;
//     return date.toLocaleDateString();
//   };

//   return (
//     <div 
//       className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
//       onClick={() => onSelect && onSelect(course)}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-start space-x-4 flex-1">
//           <div className="text-3xl">{course.image}</div>
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
//             <p className="text-gray-600 mt-1">{course.instructorName || course.instructor}</p>
//             <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
//               <span>{course.duration}</span>
//               <span>•</span>
//               <span>{course.lessons?.length || 0} lessons</span>
//               <span>•</span>
//               <span className={`px-2 py-1 rounded-full text-xs ${
//                 course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
//                 course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
//                 'bg-purple-100 text-purple-800'
//               }`}>
//                 {course.level}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         {course.enrolled && (
//           <div className="text-right ml-4">
//             <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
//             <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
//               <div 
//                 className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
//                 style={{ width: `${course.progress}%` }}
//               ></div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Progress Bar - Full Width */}
//       {course.enrolled && (
//         <div className="mt-4">
//           <div className="flex items-center justify-between text-sm mb-2">
//             <span className="text-gray-600 font-medium">Course Progress</span>
//             <span className="text-indigo-600 font-semibold">{course.progress}%</span>
//           </div>
//           <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
//             <div 
//               className={`h-full ${getProgressColor(course.progress)} transition-all duration-300`}
//               style={{ width: `${course.progress}%` }}
//             ></div>
//           </div>
//         </div>
//       )}

//       {course.enrolled && course.lastAccessed && (
//         <div className="mt-4 flex items-center justify-between">
//           <span className="text-sm text-gray-500">Last accessed: {formatDate(course.lastAccessed)}</span>
//           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
//             Continue Learning
//           </button>
//         </div>
//       )}

//       {!course.enrolled && (
//         <div className="mt-4 flex items-center justify-between">
//           <div className="flex items-center space-x-2 text-sm text-gray-600">
//             <span>⭐ {course.rating || 4.5}</span>
//             <span>•</span>
//             <span>👥 {course.enrolledStudents || 0} students</span>
//           </div>
//           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
//             Enroll Now
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CourseCard;

import React from 'react';

const CourseCard = ({ course, onSelect }) => {
  const getGradient = (progress) => {
    if (progress >= 75) return 'from-emerald-400 via-lime-300 to-emerald-500';
    if (progress >= 50) return 'from-sky-400 via-cyan-300 to-sky-500';
    if (progress >= 25) return 'from-amber-400 via-yellow-300 to-amber-500';
    return 'from-rose-400 via-red-300 to-rose-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not accessed yet';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const progress = course.progress ?? 0;

  return (
    <div
      className="neo-course-card cursor-pointer p-4 md:p-5 transition-all duration-200"
      onClick={() => onSelect && onSelect(course)}
    >
      {/* Top ribbon */}
      <div className="flex items-center justify-between mb-3 text-[10px] md:text-xs">
        <span className="g-chip">
          Quest {course.questIndex || '#'}
        </span>
        {course.category && (
          <span className="g-chip">
            {course.category}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className="text-3xl md:text-4xl">
            {course.image || '🎮'}
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-slate-50">
              {course.title}
            </h3>
            <p className="text-slate-400 mt-1 text-xs md:text-sm">
              {course.instructorName || course.instructor || 'Instructor'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] md:text-xs text-slate-400">
              {course.duration && <span>{course.duration}</span>}
              <span>•</span>
              <span>{course.lessons?.length || 0} lessons</span>
              <span>•</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.16em] border ${
                  course.level === 'Beginner'
                    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/80'
                    : course.level === 'Intermediate'
                    ? 'bg-sky-500/15 text-sky-200 border-sky-400/80'
                    : 'bg-purple-500/15 text-purple-200 border-purple-400/80'
                }`}
              >
                {course.level || 'Mixed'}
              </span>
            </div>
          </div>
        </div>

        {course.enrolled && (
          <div className="text-right ml-4 min-w-[90px]">
            <span className="text-xs md:text-sm font-semibold text-slate-50">
              {progress}% Sync
            </span>
            <div className="w-24 md:w-28 h-2 g-progress-track mt-1">
              <div
                className={`g-progress-bar bg-gradient-to-r ${getGradient(
                  progress
                )}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {course.enrolled && (
        <>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] md:text-xs mb-1">
              <span className="text-slate-400 uppercase tracking-[0.18em]">
                Course Progress
              </span>
              <span className="text-sky-300 font-semibold">
                {progress}% XP
              </span>
            </div>
            <div className="w-full h-3 g-progress-track">
              <div
                className={`g-progress-bar bg-gradient-to-r ${getGradient(
                  progress
                )}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] md:text-xs">
            <span className="text-slate-400">
              Last accessed: {formatDate(course.lastAccessed)}
            </span>
            <button className="neo-btn neo-btn-active text-[10px] md:text-xs px-3 py-1 uppercase tracking-[0.18em]">
              Resume Quest
            </button>
          </div>
        </>
      )}

      {!course.enrolled && (
        <div className="mt-4 flex items-center justify-between text-[10px] md:text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>⭐ {course.rating || 4.5}</span>
            <span>•</span>
            <span>👥 {course.enrolledStudents || 0} players</span>
          </div>
          <button className="neo-btn neo-btn-active text-[10px] md:text-xs px-3 py-1 uppercase tracking-[0.18em]">
            Enroll Quest
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCard;

