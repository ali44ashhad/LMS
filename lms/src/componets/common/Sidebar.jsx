
import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, userRole = 'student' }) => {
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
    <aside className="w-full saiba-font md:w-64 bg-[#050611] text-gray-100 shadow-sm md:min-h-screen border-r border-zinc-800">
      <nav className="mt-4 md:mt-8">
        {userRole === 'admin' && (
          <div className="px-3 md:px-6 mb-2 md:mb-4">
            <div className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-500/20 text-purple-200 rounded-lg text-xs md:text-sm saiba-font text-center border border-purple-400/60">
              Admin Panel
            </div>
          </div>
        )}

        <ul className="space-y-2 px-2 md:px-4 grid grid-cols-2 md:grid-cols-1 gap-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`neo-btn group w-full text-[10px] md:text-sm tracking-[0.15em] uppercase font-semibold flex items-center justify-center md:justify-between gap-1 md:gap-2
                    ${isActive ? 'neo-btn-active' : 'neo-btn-idle'}
                  `}
                >
                  <span className="text-lg md:text-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="mt-[2px] saiba-font md:mt-0 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {userRole === 'student' && (
        <div className="mt-6 md:mt-10 px-4 md:px-6 hidden md:block">
          <div className="bg-gradient-to-br from-indigo-600/20 via-slate-900 to-purple-600/20 rounded-xl p-4 border border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.4)]">
            <h3 className="text-xs md:text-sm font-semibold text-indigo-100 tracking-[0.18em] uppercase">
              Overall Progress
            </h3>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] md:text-xs text-indigo-100">
                <span className="font-semibold">65% Complete</span>
                <span className="text-indigo-200/80">13/20 courses</span>
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(56,189,248,0.9)]"
                  style={{ width: '65%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
