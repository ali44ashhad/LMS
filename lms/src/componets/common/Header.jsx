import React, { useState } from "react";
import logo from "../../assets/logo.jpeg";

const NESTA_SIGNIN_URL = import.meta.env.VITE_NESTA_SIGNIN_URL || '/';

const Header = ({ user, onLogout, isPublic = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = roles.includes('admin');
  const isTeacher = roles.includes('teacher');
  const roleLabel = isAdmin ? 'Admin' : isTeacher ? 'Teacher' : 'User';


  return (
    <header className="sticky top-0 z-50 bg-[#1EAAFF]">
      <div className="max-w-full mx-auto px-2">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* LOGO */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Tranga Pods Logo"
              className="h-8 sm:h-10 w-auto rounded-lg object-contain"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* SEARCH */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 md:py-2 text-xs md:text-sm
                  rounded-lg bg-white/90 border border-[#1EAAFF]
                  focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
 
            {/* USER MENU or SIGN IN (no login/signup in LMS – sign in on Nesta) */}
            <div className="relative">
              {isPublic ? (
                <a
                  href={NESTA_SIGNIN_URL}
                  className="flex items-center gap-2 bg-white/90 hover:bg-white px-3 py-2 rounded-lg border border-[#1EAAFF] text-slate-700 text-xs md:text-sm font-medium transition"
                >
                  Sign in (Nesta)
                </a>
              ) : (
                <>
                  <button
                    onClick={() => setShowDropdown((p) => !p)}
                    className={`flex items-center gap-2 bg-gray-100 md:gap-3 px-2 py-1.5 rounded-lg transition
                      ${showDropdown ? "bg-white shadow" : "hover:bg-white/70"}`}
                  >
                    <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-900 border border-cyan-400/60 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,195,221,0.6)]">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user?.name || "Avatar"} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-cyan-200 font-semibold text-xs md:text-sm">
                          {getInitials(user?.name)}
                        </span>
                      )}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1EAAFF] border border-white/20 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] z-50">
                      <div className="px-3 py-2 border-b border-white/20">
                        <p className="text-xs font-semibold text-white truncate">{roleLabel}</p>
                        <p className="text-[10px] text-white/70 uppercase tracking-[0.16em]">signed in</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-xs md:text-sm text-red-100 hover:bg-white/10 hover:text-white transition uppercase tracking-[0.14em]"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
