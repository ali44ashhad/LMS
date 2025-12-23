// import React, { useState, useEffect } from 'react';
// import { adminAPI } from '../services/api';

// const AdminDashboard = () => {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const response = await adminAPI.getStats();
//       setStats(response.stats);
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center h-64">Loading...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Students</p>
//               <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
//             </div>
//             <div className="text-4xl">👥</div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Courses</p>
//               <p className="text-3xl font-bold text-gray-900">{stats?.totalCourses || 0}</p>
//             </div>
//             <div className="text-4xl">📚</div>
//           </div>
//           <div className="mt-4 text-sm text-gray-600">
//             Published: {stats?.publishedCourses || 0}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Enrollments</p>
//               <p className="text-3xl font-bold text-gray-900">{stats?.totalEnrollments || 0}</p>
//             </div>
//             <div className="text-4xl">🎓</div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Assignments & Quizzes</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {(stats?.totalAssignments || 0) + (stats?.totalQuizzes || 0)}
//               </p>
//             </div>
//             <div className="text-4xl">📝</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


// src/pages/AdminDashboard.jsx (ya jahan bhi tumne rakha ho)
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[# ff7517]">
        <div className="neo-loader mb-3" />
        <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-cyan-300/80">
          Booting Admin Console…
        </p>
      </div>
    );
  }
 

  return (
    <div className="space-y-8">
      {/* title */}
      <div>
       
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#18455b] tracking-[0.16em] uppercase flex items-center gap-3">
          Admin Dashboard
          <span className="inline-flex h-[2px] flex-1 bg-[#ff9d00] " />
        </h1>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {/* total students */}
        <div className="neo-card neo-card-blue">
          <div className="neo-card-header">
            <span className="neo-chip">Users</span>
            <span className="neo-icon">👥</span>
          </div>
          <p className="neo-card-label">Total Students</p>
          <p className="neo-card-value">{stats?.totalStudents || 0}</p>
          <p className="neo-card-sub">Active learners in the system</p>
        </div>

        {/* total courses */}
        <div className="neo-card neo-card-purple">
          <div className="neo-card-header">
            <span className="neo-chip">Content</span>
            <span className="neo-icon">📚</span>
          </div>
          <p className="neo-card-label">Total Courses</p>
          <p className="neo-card-value">{stats?.totalCourses || 0}</p>
          <p className="neo-card-sub">
            Published: <span className="font-semibold text-cyan-200">{stats?.publishedCourses || 0}</span>
          </p>
        </div>

        {/* enrollments */}
        <div className="neo-card neo-card-green">
          <div className="neo-card-header">
            <span className="neo-chip">Engagement</span>
            <span className="neo-icon">🎓</span>
          </div>
          <p className="neo-card-label">Total Enrollments</p>
          <p className="neo-card-value">{stats?.totalEnrollments || 0}</p>
          <p className="neo-card-sub">Course joins across all students</p>
        </div>
 
      </div>
    </div>
  );
};

export default AdminDashboard;






