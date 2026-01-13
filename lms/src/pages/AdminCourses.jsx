import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

const AdminCourses = ({ onCreateNew, onEdit }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (
      !confirm(
        "⚡ Are you sure you want to delete this course? This will delete all related data."
      )
    )
      return;

    try {
      await adminAPI.deleteCourse(courseId);
      alert("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await adminAPI.updateCourse(courseId, {
        isPublished: !currentStatus,
      });
      fetchCourses();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-[0.16em] text-slate-700 flex items-center gap-3">
            Course Management
            <span className="flex-1 h-[2px] bg-gradient-to-r from-[#4DBDFF] via-cyan-400 to-transparent" />
        </h1>

        <button
          onClick={onCreateNew}
          className="
            hidden sm:flex items-center gap-2
            px-5 py-2.5 rounded-lg
            bg-[#6ED6EE] text-white
            hover:bg-[#4DBDFF] transition
            text-xs md:text-sm font-medium
          "
        >
          <span>＋</span>
          <span>Create New Course</span>
        </button>
      </div>

      {/* Mobile create button */}
      <div className="sm:hidden">
        <button
          onClick={onCreateNew}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-2 rounded-lg
            bg-[#6ED6EE] text-white
            hover:bg-purple-700 transition
            text-[11px] font-medium
          "
        >
          <span>＋</span>
          <span>Create Course</span>
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs md:text-sm tracking-[0.2em] uppercase text-cyan-500">
            Fetching course matrix…
          </p>
        </div>
      ) : courses.length === 0 ? (
        /* Empty state */
        <div className="bg-white border border-[#8AD5FF] rounded-xl shadow-sm flex flex-col items-center justify-center text-center py-10">
          <div className="text-5xl mb-3">📚</div>
          <h2 className="text-xl font-semibold tracking-[0.14em] uppercase text-slate-700">
            No Courses Deployed
          </h2>
          <p className="text-sm mt-2 max-w-md text-slate-500">
            Spin up your first course to activate the learning environment and
            start enrolling students.
          </p>
          <button
            onClick={onCreateNew}
            className="
              mt-6 flex items-center gap-2
              px-6 py-2.5 rounded-lg
              bg-[#6ED6EE] text-white
              hover:bg-purple-700 transition
              text-xs md:text-sm font-medium
            "
          >
            <span>＋</span>
            <span>Create Course</span>
          </button>
        </div>
      ) : (
        /* Courses grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`
                p-5 rounded-xl border shadow-sm
                ${
                  course.isPublished
                    ? "bg-white border-[#8AD5FF]"
                    : "bg-slate-50 border-[#8AD5FF]"
                }
              `}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#C0EAFF] flex items-center justify-center">
                    <span className="text-3xl">
                      {course.image || "📘"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-800">
                      {course.title}
                    </h3>
                    <div 
                      className="text-xs md:text-sm mt-1 text-slate-500 line-clamp-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: course.description || '' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleTogglePublish(course._id, course.isPublished)
                  }
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                    ${
                      course.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }
                  `}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      course.isPublished ? "bg-green-500" : "bg-slate-400"
                    }`}
                  />
                  {course.isPublished ? "Published" : "Draft"}
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                {course.category && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="px-2 py-0.5 rounded-full bg-[#C0EAFF] text-purple-700">
                    {course.level}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    course.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {course.isPublished ? "Live in Catalog" : "Draft Mode"}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-xs md:text-sm">
                <div>
                  <p className="text-slate-400 uppercase tracking-wide">
                    Duration
                  </p>
                  <p className="font-semibold text-slate-700">
                    {course.duration || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wide">
                    Lessons
                  </p>
                  <p className="font-semibold text-slate-700">
                    {course.lessons?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wide">
                    Students
                  </p>
                  <p className="font-semibold text-slate-700">
                    {course.enrolledStudents || 0}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="
                    flex-1 px-4 py-2 rounded-lg
                    bg-red-600 text-white
                    hover:bg-red-700 transition
                    text-sm font-medium
                  "
                >
                  Delete Course
                </button>
                <button
                  onClick={() => onEdit(course)}
                  className="
                    flex-1 px-4 py-2 rounded-lg
                    bg-slate-200 text-slate-700
                    hover:bg-slate-300 transition
                    text-sm font-medium
                  "
                >
                  Edit &amp; Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
