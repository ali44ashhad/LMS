import React, { useState, useEffect } from "react";
import { courseAPI, enrollmentAPI } from "../services/api";
import CourseGrid from "../componets/courses/CourseGrid";

const Courses = ({ onCourseSelect, isPublic = false }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Robotics",
    "Coding",
    "AI/ ML",
    "Others"

  ];

  useEffect(() => {
    fetchData();
  }, [isPublic]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (isPublic) {
        const coursesRes = await courseAPI.getAll();
        setCourses(coursesRes.courses || []);
      } else {
        // Logged-in: My Courses = only enrolled courses
        const { enrollments } = await enrollmentAPI.getMy();
        const enrolledList = enrollments || [];
        const coursesWithDetails = await Promise.all(
          enrolledList.map(async (e) => {
            const courseId = e.course_id ?? e.course?.id ?? e.course?._id;
            if (!courseId) return null;
            try {
              const res = await courseAPI.getById(courseId);
              const course = res.course ?? res;
              return {
                ...course,
                _id: course._id ?? course.id,
                id: course.id ?? course._id,
                enrolled: true,
                progress: e.progress ?? 0,
                lastAccessed: e.lastAccessed ?? e.last_accessed,
              };
            } catch {
              return null;
            }
          })
        );
        setCourses(coursesWithDetails.filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const coursesNormalized = courses.map((course) => ({
    ...course,
    _id: course._id ?? course.id,
  }));

  const filteredCourses = coursesNormalized.filter((course) => {
    const matchesCategory =
      filter === "all" || course.category === filter;
    const instructorName = course.instructor_name ?? course.instructorName;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading interactive modules...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* TITLE */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-400/70 mb-1">
          {isPublic ? "Explore Courses" : "Your enrollments"}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#545454] tracking-[0.14em] uppercase flex items-center gap-3">
          {isPublic ? "Courses" : "My Courses"}
          <span className="flex-1 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
        </h1>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* SEARCH */}
        <div className="w-full md:w-1/4">
          <input
            type="text"
            placeholder="🔍 Search by title or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full
              px-4 py-2
              border border-slate-300
              rounded-lg
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400
            "
          />
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap gap-2 w-full md:w-3/4">
          {categories.map((cat) => {
            const value = cat === "All" ? "all" : cat;
            const isActive = filter === value;

            return (
              <button
                key={cat}
                onClick={() => setFilter(value)}
                className={`
                  px-4 py-2
                  text-xs md:text-sm
                  rounded-md
                  border
                  transition
                  ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* COURSES GRID (published courses) */}
      {filteredCourses.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
            {isPublic ? "Courses" : "My Courses"} ({filteredCourses.length})
          </h2>

          <CourseGrid
            courses={filteredCourses}
            onCourseSelect={onCourseSelect}
            isPublic={isPublic}
          />
        </section>
      )}

      {/* EMPTY STATE */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 space-y-3 text-slate-400">
          <div className="text-6xl">{isPublic ? "❌" : "📚"}</div>
          <h3 className="text-xl font-semibold text-slate-600">
            {isPublic ? "No courses found" : "No enrolled courses yet"}
          </h3>
          <p>
            {isPublic
              ? "Try adjusting your keywords or filters"
              : "Enroll in courses from the Dashboard or explore the catalog to get started."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
