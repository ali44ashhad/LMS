import React from 'react';
import robot from '../../assets/robot.png';
import { useRealTimeProgress } from '../../hooks/useRealTimeProgress';

const Sidebar = ({ activeTab, setActiveTab, userRole = 'student' }) => {
  // Enable real-time progress updates every 2 seconds for students
  const { overallProgress, completedCourses, totalCourses } = useRealTimeProgress(
    userRole === 'student',
    2000 // Poll every 2 seconds
  );

  const progressData = {
    overallProgress,
    completedCourses,
    totalCourses
  };
  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: '👨‍💼' },
    { id: 'admin-users', label: 'User Management', icon: '👥' },
    { id: 'admin-courses', label: 'Manage Courses', icon: '🎓' },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <aside className="w-full md:w-64 bg-[#E7F6FE] text-slate-700 border-r border-[#1EAAFF] md:min-h-screen">
      <nav className="mt-4 md:mt-8">
        {userRole === 'admin' && (
          <div className="px-4 mb-4">
            <div className="bg-[#C0EAFF] text-gray-700 rounded-lg text-sm text-center py-2 font-semibold">
              Admin Panel
            </div>
          </div>
        )}

        <ul className="space-y-2 px-3 grid grid-cols-2 md:grid-cols-1 gap-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
               <button
  onClick={() => setActiveTab(item.id)}
  className={`w-full flex items-center justify-center md:justify-between gap-2 
    px-3 py-2 rounded-md text-xs md:text-sm font-semibold uppercase tracking-wide 
    transition border
    ${
      isActive
        ? 'bg-white shadow text-slate-900 border-[#1EAAFF]'
        : 'bg-white/40 border-[#1EAAFF] hover:bg-white/70'
    }`}
>

                  <span className="text-lg">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {userRole === 'student' && (
        <div className="hidden md:block mt-10 px-4">
          <div className="bg-white rounded-xl p-4 border border-[#1EAAFF]">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Overall Progress
            </h3>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-semibold">{progressData.overallProgress}% Complete</span>
                <span>{progressData.completedCourses} / {progressData.totalCourses} courses</span>
              </div>

              <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 bg-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressData.overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="hidden md:flex justify-center mt-auto p-4">
  <img
    src={robot}
    alt="Learning assistant robot"
    className="w-60 max-w-full   py-20 object-contain"
  />
</div>

    </aside>
  );
};

export default Sidebar;
