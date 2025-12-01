// // src/components/common/Header.jsx
// import React, { useState } from 'react';

// const Header = ({ user, onLogout }) => {
//   const [showDropdown, setShowDropdown] = useState(false);

//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name
//       .split(' ')
//       .filter(Boolean)
//       .map((n) => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getRoleBadgeColor = (role) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-purple-500/20 text-purple-100 border border-purple-400/70';
//       case 'teacher':
//         return 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/70';
//       default:
//         return 'bg-sky-500/20 text-sky-100 border border-sky-400/70';
//     }
//   };

//   return (
//     <header className="bg-[#050611] border-b border-zinc-800 sticky top-0 z-50 shadow-[0_0_28px_rgba(15,23,42,0.9)]">
//       <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8">
//         <div className="flex justify-between items-center h-14 md:h-16">
//           {/* Logo / Brand */}
//           <div className="flex items-center">
//             <div className="flex-shrink-0 flex items-center">
//               <div className="h-8 w-8 md:h-9 md:w-9 bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 rounded-xl flex items-center justify-center border border-sky-300/70 shadow-[0_0_18px_rgba(56,189,248,0.7)]">
//                 <svg
//                   className="h-4 w-4 md:h-5 md:w-5 text-white"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 14l9-5-9-5-9 5 9 5z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-2 saiba-font md:ml-3">
//                 <h1 className="text-lg md:text-2xl saiba-font font-extrabold text-slate-50 tracking-[0.18em] uppercase leading-tight">
//                   LearnHub
//                 </h1>
//                 <p className="hidden md:block text-[10px] tracking-[0.25em] text-sky-300/80 uppercase">
//                   Gamified Learning Console
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Right side */}
//           <div className="flex items-center space-x-2 md:space-x-4">
//             {/* Search */}
//             <div className="relative hidden md:block neo-input-wrapper">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg
//                   className="h-4 w-4 text-slate-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                   />
//                 </svg>
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search modules..."
//                 className="neo-input w-48 lg:w-64 pl-9 pr-3 py-1.5 md:py-2 text-xs md:text-sm"
//               />
//             </div>

//             {/* User / Profile */}
//             <div className="relative ">
//               <button
//                 onClick={() => setShowDropdown((prev) => !prev)}
//                 className={`neo-btn group flex items-center space-x-2 md:space-x-3 ${
//                   showDropdown ? 'neo-btn-active' : 'neo-btn-idle'
//                 }`}
//               >
//                 <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-900/80 border border-sky-400/60 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.6)]">
//                   <span className="text-sky-200 font-semibold text-xs md:text-sm">
//                     {getInitials(user?.name)}
//                   </span>
//                 </div>
//                 <div className="text-left hidden sm:block">
//                   <p className="text-[11px] md:text-sm font-semibold text-slate-50 leading-tight">
//                     {user?.name || 'User'}
//                   </p>
//                   <span
//                     className={`mt-0.5 inline-block text-[9px] md:text-[10px] rounded-full px-2 py-[1px] uppercase tracking-[0.16em] ${getRoleBadgeColor(
//                       user?.role
//                     )}`}
//                   >
//                     {user?.role || 'student'}
//                   </span>
//                 </div>
//               </button>

//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 w-48 bg-[#050611] border border-zinc-700 rounded-xl shadow-[0_0_18px_rgba(15,23,42,0.9)] py-1 z-50">
//                   <div className="px-3 py-2 border-b border-zinc-700/70">
//                     <p className="text-xs font-semibold text-slate-100 truncate">
//                       {user?.name || 'User'}
//                     </p>
//                     <p className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">
//                       {user?.email || 'signed in'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={onLogout}
//                     className="w-full text-left px-4 py-2 text-xs md:text-sm text-red-200 hover:bg-red-500/10 hover:text-red-300 transition-colors tracking-[0.14em] uppercase"
//                   >
//                     Sign Out
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


// src/components/common/Header.jsx
import React, { useState } from 'react';

const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-100 border border-purple-400/70';
      case 'teacher':
        return 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/70';
      default:
        return 'bg-sky-500/20 text-sky-100 border border-sky-400/70';
    }
  };

  return (
    // ⬇⬇ yahan changes hain
    <header className="relative sticky top-0 z-50">
      {/* Zig-zag background layer */}
      <div
        className="
          absolute inset-0
          bg-[#050611]
          border-b border-zinc-800
          shadow-[0_0_28px_rgba(15,23,42,0.9)]
          [clip-path:polygon(0_0,90%_0,100%_50%,90%_100%,10%_100%,0_50%)]
        "
      />

      {/* Actual header content (upar rakha hua) */}
      <div className="relative max-w-full mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 md:h-9 md:w-9 bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 rounded-xl flex items-center justify-center border border-sky-300/70 shadow-[0_0_18px_rgba(56,189,248,0.7)]">
                <svg
                  className="h-4 w-4 md:h-5 md:w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                </svg>
              </div>
              <div className="ml-2 saiba-font md:ml-3">
                <h1 className="text-lg md:text-2xl saiba-font font-extrabold text-slate-50 tracking-[0.18em] uppercase leading-tight">
                  LearnHub
                </h1>
                <p className="hidden md:block text-[10px] tracking-[0.25em] text-sky-300/80 uppercase">
                  Gamified Learning Console
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search */}
            <div className="relative hidden md:block neo-input-wrapper">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search modules..."
                className="neo-input w-48 lg:w-64 pl-9 pr-3 py-1.5 md:py-2 text-xs md:text-sm"
              />
            </div>

            {/* User / Profile */}
            <div className="relative ">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className={`neo-btn group flex items-center space-x-2 md:space-x-3 ${
                  showDropdown ? 'neo-btn-active' : 'neo-btn-idle'
                }`}
              >
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-900/80 border border-sky-400/60 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.6)]">
                  <span className="text-sky-200 font-semibold text-xs md:text-sm">
                    {getInitials(user?.name)}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] md:text-sm font-semibold text-slate-50 leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <span
                    className={`mt-0.5 inline-block text-[9px] md:text-[10px] rounded-full px-2 py-[1px] uppercase tracking-[0.16em] ${getRoleBadgeColor(
                      user?.role
                    )}`}
                  >
                    {user?.role || 'student'}
                  </span>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#050611] border border-zinc-700 rounded-xl shadow-[0_0_18px_rgba(15,23,42,0.9)] py-1 z-50">
                  <div className="px-3 py-2 border-b border-zinc-700/70">
                    <p className="text-xs font-semibold text-slate-100 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.16em]">
                      {user?.email || 'signed in'}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs md:text-sm text-red-200 hover:bg-red-500/10 hover:text-red-300 transition-colors tracking-[0.14em] uppercase"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
