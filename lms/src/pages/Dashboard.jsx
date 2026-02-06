import React, { useState, useEffect } from "react";
import { useRealTimeProgress } from "../hooks/useRealTimeProgress";
import CourseCard from "../componets/courses/CourseCard";
import CourseGrid from "../componets/courses/CourseGrid";
import StatsCards from "../componets/dashboard/StatsCards";
import ProgressChart from "../componets/dashboard/ProgressChart";
import { courseAPI } from "../services/api";

const Dashboard = ({ onCourseSelect }) => {
  const [user] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [allCourses, setAllCourses] = useState([]);

  // Same source as sidebar: enrollments with progress computed on frontend (video lessons only)
  const {
    enrollments: enrolledCourses,
    overallProgress: averageProgress,
    completedCourses,
    totalCourses,
    loading,
  } = useRealTimeProgress(true, 2000);

  const recentCourses = enrolledCourses.slice(0, 3);

  // All published courses for "Other available courses"
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await courseAPI.getAll();
        setAllCourses(res.courses || []);
      } catch (err) {
        console.error("Error fetching all courses:", err);
      }
    };
    fetchAll();
  }, []);

  const enrolledCourseIds = new Set(
    enrolledCourses
      .map((e) => e.course_id ?? e.course?.id ?? e.course?._id)
      .filter(Boolean)
      .map(String)
  );
  const availableCourses = allCourses.filter(
    (c) => !enrolledCourseIds.has(String(c.id ?? c._id))
  );

  const stats = {
    totalCourses,
    completedCourses,
    inProgressCourses: enrolledCourses.filter(
      (e) => (e.progress || 0) > 0 && (e.progress || 0) < 100
    ).length,
    averageProgress,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-white border border-[#8AD5FF] rounded-lg px-6 py-4 shadow-sm">
          <p className="text-slate-500 text-xs md:text-sm tracking-[0.22em] uppercase">
            Initializing Dashboard Systems...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div>
          {/* {user.role !== "admin" && (
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-500/80 mb-1">
              Player Console
            </p>
          )} */}
          <h1 className="text-2xl md:text-3xl text-[#545454] font-extrabold tracking-[0.18em] uppercase">
            Dashboard
          </h1>
          <p className="text-[10px] md:text-xs text-slate-400 tracking-[0.25em] uppercase mt-1">
            Welcome back, {user.name || "Operative"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] md:text-xs">
          <span className="px-3 py-1 rounded-full border border-[#1EAAFF] text-slate-500 uppercase tracking-[0.16em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            Sync: {stats.averageProgress}% Complete
          </span>
          <span className="px-3 py-1 rounded-full border border-[#1EAAFF] text-slate-500 uppercase tracking-[0.16em] hidden sm:inline">
            🎯 XP: {stats.completedCourses * 120}
          </span>
        </div>
      </div>

      {/* STATS */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#8AD5FF] rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-5">
              <div>
                <h1 className="text-lg md:text-xl font-semibold tracking-[0.16em] uppercase text-[#545454]">
                  Active Quests
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 tracking-[0.18em] uppercase mt-1">
                  Continue where you left off
                </p>
              </div>

              {recentCourses.length > 0 && (
                <span className="px-3 py-1 rounded-full border border-[#1EAAFF] text-[10px] uppercase tracking-[0.16em] text-slate-500">
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
                    key={enrollment.id ?? enrollment._id ?? idx}
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

          {/* Other available courses – below Active Quests */}
          <div className="p-3">
            <h2 className="text-lg md:text-xl font-semibold tracking-[0.16em] uppercase text-[#545454] mb-2">
              Other available courses
            </h2>
            <p className="text-[10px] md:text-xs text-slate-400 tracking-[0.18em] uppercase mb-4">
              All courses you haven’t enrolled in yet
            </p>
            {availableCourses.length === 0 ? (
              <p className="text-sm text-slate-400">
                {allCourses.length === 0
                  ? "Loading courses..."
                  : "You're enrolled in all available courses, or no other courses right now."}
              </p>
            ) : (
              <CourseGrid
                courses={availableCourses}
                onCourseSelect={onCourseSelect}
                isPublic={false}
              />
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white border border-[#8AD5FF] rounded-lg shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold tracking-[0.16em] uppercase text-[#545454] mb-3 md:mb-4">
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
