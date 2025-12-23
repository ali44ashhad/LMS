// // src/pages/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { enrollmentAPI, assignmentAPI, quizAPI } from '../services/api';
// import CourseCard from '../componets/courses/CourseCard';
// import StatsCards from '../componets/dashboard/StatsCards';
// import ProgressChart from '../componets/dashboard/ProgressChart';

// const Dashboard = () => {
//   const [enrolledCourses, setEnrolledCourses] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [quizzes, setQuizzes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const [enrollmentsRes, assignmentsRes, quizzesRes] = await Promise.all([
//         enrollmentAPI.getMy(),
//         assignmentAPI.getAll(),
//         quizAPI.getAll()
//       ]);
      
//       setEnrolledCourses(enrollmentsRes.enrollments || []);
//       setAssignments(assignmentsRes.assignments || []);
//       setQuizzes(quizzesRes.quizzes || []);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const recentCourses = enrolledCourses.slice(0, 3);
//   const pendingAssignments = assignments.filter(a => {
//     const submission = a.submissions?.find(s => s.student === user._id);
//     return !submission;
//   });
//   const upcomingQuizzes = quizzes.slice(0, 3);
  
//   const stats = {
//     totalCourses: enrolledCourses.length,
//     completedCourses: enrolledCourses.filter(e => e.progress === 100).length,
//     totalAssignments: assignments.length,
//     pendingAssignments: pendingAssignments.length,
//     averageProgress: enrolledCourses.length > 0 
//       ? Math.round(enrolledCourses.reduce((acc, e) => acc + (e.progress || 0), 0) / enrolledCourses.length)
//       : 0
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-gray-500">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 md:space-y-6">
//       <div className="flex flex-col md:flex-row md:justify-between md:items-center">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
//         <span className="text-sm md:text-base text-gray-500 mt-1 md:mt-0">Welcome back, {user.name}!</span>
//       </div>

//       {/* Stats Cards */}
//       <StatsCards stats={stats} />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
//         {/* Recent Courses */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
//             <div className="flex justify-between items-center mb-4 md:mb-6">
//               <h2 className="text-lg md:text-xl font-semibold text-gray-800">Continue Learning</h2>
//             </div>
//             {recentCourses.length === 0 ? (
//               <p className="text-sm md:text-base text-gray-500">No enrolled courses yet. Explore courses to get started!</p>
//             ) : (
//               <div className="space-y-3 md:space-y-4">
//                 {recentCourses.map(enrollment => (
//                   <CourseCard 
//                     key={enrollment._id} 
//                     course={{
//                       ...enrollment.course,
//                       enrolled: true,
//                       progress: enrollment.progress,
//                       lastAccessed: enrollment.lastAccessed
//                     }} 
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Sidebar */}
//         <div className="space-y-4 md:space-y-6">
//           {/* Progress Chart */}
//           <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
//             <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Learning Progress</h3>
//             <ProgressChart courses={enrolledCourses} />
//           </div>

//           {/* Pending Assignments */}
//           <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
//             <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Pending Assignments</h3>
//             <div className="space-y-2 md:space-y-3">
//               {pendingAssignments.length === 0 ? (
//                 <p className="text-xs md:text-sm text-gray-500">No pending assignments</p>
//               ) : (
//                 pendingAssignments.slice(0, 3).map(assignment => (
//                   <div key={assignment._id} className="border-l-4 border-yellow-500 pl-3 md:pl-4 py-2">
//                     <h4 className="text-sm md:text-base font-medium text-gray-900">{assignment.title}</h4>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Due: {new Date(assignment.dueDate).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// src/pages/Dashboard.jsx


import React, { useState, useEffect } from 'react';
import { enrollmentAPI } from '../services/api';
import CourseCard from '../componets/courses/CourseCard';
import StatsCards from '../componets/dashboard/StatsCards';
import ProgressChart from '../componets/dashboard/ProgressChart';

const Dashboard = ({ onCourseSelect }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const enrollmentsRes = await enrollmentAPI.getMy();
      setEnrolledCourses(enrollmentsRes.enrollments || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentCourses = enrolledCourses.slice(0, 3);

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((e) => e.progress === 100).length,
    inProgressCourses: enrolledCourses.filter(
      (e) => e.progress > 0 && e.progress < 100
    ).length,
    averageProgress:
      enrolledCourses.length > 0
        ? Math.round(
            enrolledCourses.reduce((acc, e) => acc + (e.progress || 0), 0) /
              enrolledCourses.length
          )
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="neo-card px-6 py-4">
          <p className="text-slate-200 text-xs md:text-sm tracking-[0.22em] uppercase">
            Initializing Dashboard Systems...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 text-slate-100">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          {user.role !== 'admin' && (
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80 mb-1">
              Player Console
            </p>
          )}
          <h1 className="text-2xl md:text-3xl text-[#545454] font-extrabold tracking-[0.18em] uppercase">
            Dashboard
          </h1>
          <p className="text-[10px] md:text-xs text-slate-400 tracking-[0.25em] uppercase mt-1">
            Welcome back, {user.name || 'Operative'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] md:text-xs">
          <div className="g-chip flex items-center">
            <span className="w-2 h-2 rounded-full bg-lime-400 mr-2 animate-pulse" />
            Sync: {stats.averageProgress}% Complete
          </div>
          <div className="g-chip hidden sm:flex items-center">
            🎯 XP: {stats.completedCourses * 120}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left side – courses */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Quests */}
          <div className="neo-card p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-5">
              <div>
                <h1 className="text-lg md:text-xl font-semibold tracking-[0.16em] uppercase">
                  Active Quests
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 tracking-[0.18em] uppercase mt-1">
                  Continue where you left off
                </p>
              </div>
              {recentCourses.length > 0 && (
                <span className="g-chip">
                  {recentCourses.length} Courses Tracked
                </span>
              )}
            </div>

            {recentCourses.length === 0 ? (
              <p className="text-sm md:text-base text-slate-400">
                No quests accepted yet. Browse the course library to start your
                first mission.
              </p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentCourses.map((enrollment, idx) => (
                  <CourseCard
                    key={enrollment._id}
                    course={{
                      ...enrollment.course,
                      enrolled: true,
                      progress: enrollment.progress,
                      lastAccessed: enrollment.lastAccessed,
                      questIndex: idx + 1,
                    }}
                    onSelect={onCourseSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side – progress */}
        <div className="space-y-4 md:space-y-6">
          <div className="neo-card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold tracking-[0.16em] uppercase mb-3 md:mb-4">
              Progress Monitor
            </h3>
            <ProgressChart courses={enrolledCourses} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;






