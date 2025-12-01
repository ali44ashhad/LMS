import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

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
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('⚡ Are you sure you want to delete this course? This will delete all related data.')) return;

    try {
      await adminAPI.deleteCourse(courseId);
      alert('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await adminAPI.updateCourse(courseId, { isPublished: !currentStatus });
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-sky-300/80 mb-1">
            Content Console
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-50 tracking-[0.16em] uppercase flex items-center gap-3">
            Course Management
            <span className="inline-flex h-[2px] flex-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-transparent shadow-[0_0_16px_rgba(45,212,191,0.9)]" />
          </h1>
        </div>

        <button
          onClick={onCreateNew}
          className="neo-btn neo-btn-active hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 text-xs md:text-sm"
        >
          <span>＋</span>
          <span>Create New Course</span>
        </button>
      </div>

      {/* Mobile create button */}
      <div className="sm:hidden">
        <button
          onClick={onCreateNew}
          className="neo-btn neo-btn-active w-full flex items-center justify-center gap-2 px-4 py-2 text-[11px]"
        >
          <span>＋</span>
          <span>Create Course</span>
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-200">
          <div className="neo-loader mb-3" />
          <p className="text-xs md:text-sm tracking-[0.2em] uppercase text-sky-300/80">
            Fetching course matrix…
          </p>
        </div>
      ) : courses.length === 0 ? (
        // Empty state
        <div className="neo-card flex flex-col items-center justify-center text-center py-10">
          <div className="text-5xl mb-3 drop-shadow-[0_0_18px_rgba(56,189,248,0.6)]">📚</div>
          <h2 className="text-xl font-semibold text-slate-50 tracking-[0.14em] uppercase">
            No Courses Deployed
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md">
            Spin up your first course to activate the learning environment and start enrolling students.
          </p>
          <button
            onClick={onCreateNew}
            className="neo-btn neo-btn-active mt-6 px-6 py-2.5 text-xs md:text-sm flex items-center gap-2"
          >
            <span>＋</span>
            <span>Create Course</span>
          </button>
        </div>
      ) : (
        // Courses grid
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`neo-course-card ${
                course.isPublished ? 'neo-course-live' : 'neo-course-draft'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-start gap-4">
                  <div className="neo-course-icon">
                    <span className="text-3xl">
                      {course.image || '📘'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-50">
                      {course.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleTogglePublish(course._id, course.isPublished)}
                  className={`neo-publish-toggle ${
                    course.isPublished ? 'neo-publish-on' : 'neo-publish-off'
                  }`}
                >
                  <span className="neo-publish-dot" />
                  <span className="neo-publish-label">
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.category && (
                  <span className="neo-pill neo-pill-sky">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="neo-pill neo-pill-purple">
                    {course.level}
                  </span>
                )}
                <span
                  className={`neo-pill ${
                    course.isPublished ? 'neo-pill-green' : 'neo-pill-gray'
                  }`}
                >
                  {course.isPublished ? 'Live in Catalog' : 'Draft Mode'}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-xs md:text-sm">
                <div>
                  <p className="neo-stat-label">Duration</p>
                  <p className="neo-stat-value">
                    {course.duration || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="neo-stat-label">Lessons</p>
                  <p className="neo-stat-value">
                    {course.lessons?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="neo-stat-label">Students</p>
                  <p className="neo-stat-value">
                    {course.enrolledStudents || 0}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="neo-danger-btn flex-1"
                >
                  Delete Course
                </button>
                <button
                  onClick={() => onEdit(course)}
                  className="neo-secondary-btn flex-1"
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
