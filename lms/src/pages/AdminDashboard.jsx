import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

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
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-cyan-500">
          Booting Admin Console…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-700 tracking-[0.16em] uppercase flex items-center gap-3">
        Admin Dashboard
        <span className="h-[2px] flex-1 bg-orange-400" />
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 text-xs uppercase tracking-wider rounded-full bg-slate-100 text-slate-600">
              Users
            </span>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="text-3xl font-bold text-slate-800">
            {stats?.totalStudents || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Active learners in the system
          </p>
        </div>

        {/* Total Courses */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 text-xs uppercase tracking-wider rounded-full bg-slate-100 text-slate-600">
              Content
            </span>
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-sm text-slate-500">Total Courses</p>
          <p className="text-3xl font-bold text-slate-800">
            {stats?.totalCourses || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Published:{" "}
            <span className="font-semibold text-cyan-600">
              {stats?.publishedCourses || 0}
            </span>
          </p>
        </div>

        {/* Enrollments */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-0.5 text-xs uppercase tracking-wider rounded-full bg-slate-100 text-slate-600">
              Engagement
            </span>
            <span className="text-3xl">🎓</span>
          </div>
          <p className="text-sm text-slate-500">Total Enrollments</p>
          <p className="text-3xl font-bold text-slate-800">
            {stats?.totalEnrollments || 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Course joins across all students
          </p>
        </div>
 
      </div>
    </div>
  );
};

export default AdminDashboard;
