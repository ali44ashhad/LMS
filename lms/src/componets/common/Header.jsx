import React, { useState } from "react";
import logo from "../../assets/logo.png";

const Header = ({ user, onLogout }) => {
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-600/20 text-purple-100 border border-purple-400/70";
      case "teacher":
        return "bg-lime-500/20 text-lime-100 border border-lime-400/70";
      default:
        return "bg-cyan-500/20 text-cyan-100 border border-cyan-400/70";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#5C67E3]">
      <div className="max-w-full mx-auto px-2">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* LOGO */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Tranga Pods Logo"
              className="h-8 sm:h-10 w-auto object-contain"
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
                placeholder="Search modules..."
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 md:py-2 text-xs md:text-sm
                  rounded-lg bg-white/90 border border-slate-300
                  focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {/* USER MENU */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((p) => !p)}
                className={`flex items-center gap-2 bg-gray-100 md:gap-3 px-2 py-1.5 rounded-lg transition
                  ${
                    showDropdown
                      ? "bg-white shadow"
                      : "hover:bg-white/70"
                  }`}
              >
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-900 border border-cyan-400/60
                  flex items-center justify-center shadow-[0_0_10px_rgba(0,195,221,0.6)]">
                  <span className="text-cyan-200 font-semibold text-xs md:text-sm">
                    {getInitials(user?.name)}
                  </span>
                </div>

                {/* <div className="hidden sm:block text-left">
                  <p className="text-[11px] md:text-sm font-semibold text-[#545454] leading-tight">
                    {user?.name || "User"}
                  </p>
                  <span
                    className={`inline-block mt-0.5 px-2 py-[1px] rounded-full
                      text-[9px] md:text-[10px] uppercase text-gray-900 tracking-[0.16em]
                      ${getRoleBadgeColor(user?.role)}`}
                  >
                    {user?.role || "student"}
                  </span>
                </div> */}
              </button>

              {/* DROPDOWN */}
            {showDropdown && (
  <div
    className="absolute right-0 mt-2 w-48 bg-[#5C67E3]
    border border-white/20 rounded-xl
    shadow-[0_10px_30px_rgba(0,0,0,0.35)] z-50"
  >
    <div className="px-3 py-2 border-b border-white/20">
      <p className="text-xs font-semibold text-white truncate">
        {user?.name || "User"}
      </p>
      <p className="text-[10px] text-white/70 uppercase tracking-[0.16em]">
        {user?.email || "signed in"}
      </p>
    </div>

    <button
      onClick={onLogout}
      className="w-full text-left px-4 py-2 text-xs md:text-sm
        text-red-100 hover:bg-white/10 hover:text-white
        transition uppercase tracking-[0.14em]"
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
