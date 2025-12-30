import React, { useState, useEffect } from "react";
import { courseAPI, enrollmentAPI } from "../services/api";
import CourseCard from "../componets/courses/CourseCard";
import CourseGrid from "../componets/courses/CourseGrid";

const Courses = ({ onCourseSelect }) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Development",
    "Data Science",
    "Design",
    "Marketing",
    "Business",
    "Other",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseAPI.getAll(),
        enrollmentAPI.getMy(),
      ]);
      setCourses(coursesRes.courses || []);
      setEnrollments(enrollmentsRes.enrollments || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const coursesWithProgress = courses.map((course) => {
    const enrollment = enrollments.find(
      (e) => e.course._id === course._id
    );
    return {
      ...course,
      enrolled: !!enrollment,
      progress: enrollment?.progress || 0,
      lastAccessed: enrollment?.lastAccessed || null,
    };
  });

  const filteredCourses = coursesWithProgress.filter((course) => {
    const matchesCategory =
      filter === "all" || course.category === filter;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const enrolledCourses = filteredCourses.filter((c) => c.enrolled);
  const availableCourses = filteredCourses.filter((c) => !c.enrolled);

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentAPI.enroll(courseId);
      alert("Successfully enrolled in course!");
      fetchData();
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Failed to enroll in course");
    }
  };

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
          Explore Courses
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#545454] tracking-[0.14em] uppercase flex items-center gap-3">
          Courses
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

      {/* ENROLLED COURSES */}
      {enrolledCourses.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
            My Learning ({enrolledCourses.length})
          </h2>

          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onSelect={onCourseSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* AVAILABLE COURSES */}
      {availableCourses.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-4">
            Available Courses ({availableCourses.length})
          </h2>

          <CourseGrid
            courses={availableCourses}
            onCourseSelect={onCourseSelect}
            onEnroll={handleEnroll}
          />
        </section>
      )}

      {/* EMPTY STATE */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 space-y-3 text-slate-400">
          <div className="text-6xl">❌</div>
          <h3 className="text-xl font-semibold text-slate-600">
            No courses found
          </h3>
          <p>Try adjusting your keywords or filters</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
