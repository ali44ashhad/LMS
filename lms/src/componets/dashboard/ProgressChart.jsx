// // src/components/dashboard/ProgressChart.jsx
// import React from 'react';

// const ProgressChart = ({ courses }) => {
//   const enrolledCourses = courses.filter(course => course.enrolled);
  
//   return (
//     <div className="space-y-4">
//       {enrolledCourses.map(course => (
//         <div key={course.id} className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <span className="text-xl">{course.image}</span>
//             <div>
//               <p className="text-sm font-medium text-gray-900">{course.title}</p>
//               <p className="text-xs text-gray-500">{course.progress}% complete</p>
//             </div>
//           </div>
//           <div className="w-24 h-2 bg-gray-200 rounded-full">
//             <div 
//               className="h-2 bg-purple-600 rounded-full"
//               style={{ width: `${course.progress}%` }}
//             ></div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ProgressChart;

// src/components/dashboard/ProgressChart.jsx
import React from 'react';

const ProgressChart = ({ courses = [] }) => {
  const items = courses.map((item) => {
    const course = item.course || item;
    return {
      id: course._id || item._id || course.id || item.id,
      title: course.title || 'Untitled',
      progress: course.progress ?? item.progress ?? 0,
      emoji: course.image || '🎮',
    };
  });

  if (items.length === 0) {
    return (
      <p className="text-xs md:text-sm text-slate-400">
        No progress data yet. Start a course to activate tracking.
      </p>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {items.map((course) => {
        const pct = Math.min(course.progress, 100);
        return (
          <div
            key={course.id}
            className="flex items-center justify-between gap-3 text-xs md:text-sm"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl md:text-2xl">{course.emoji}</span>
              <div className="flex-1">
                <p className="font-medium text-slate-[#545454] truncate">
                  {course.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-[0.16em]">
                  Sync {pct}% • XP Boost
                </p>
              </div>
            </div>
            <div className="w-28 md:w-32 h-2.5 g-progress-track">
              <div
                className="g-progress-bar bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressChart;






