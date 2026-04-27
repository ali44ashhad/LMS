import React from "react";
import CourseCard from "./CourseCard";

const CourseGrid = ({ courses, onCourseSelect, isPublic = false }) => {
  const getTextExcerpt = (html, maxLen = 140) => {
    const text = (html || "")
      .toString()
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return "";
    return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {courses.map((course) => (
        <div
          key={course._id || course.id}
          className="
            bg-white
            rounded-lg
            border border-gray-200
            p-4 md:p-6
            shadow-sm
            hover:shadow-md
            transition-shadow
            flex flex-col
          "
        >
          {/* TOP */}
          <div className="text-center mb-4">
            <div className="text-3xl md:text-4xl mb-2 leading-none">
              {course.image}
            </div>

            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug break-words line-clamp-2 min-h-[2.75rem]">
              {course.title}
            </h3>

            {/* <p className="text-gray-600 text-xs md:text-sm mt-1">
              {course.instructor_name ?? course.instructorName ?? course.instructor}
            </p> */}
          </div>

          {/* META INFO */}
          <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
            <div className="flex items-baseline justify-between gap-3">
              <span className="shrink-0">Duration:</span>
              <span className="font-medium text-right break-words">
                {course.duration || "N/A"}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <span className="shrink-0">Lessons:</span>
              <span className="font-medium text-right">
                {course.lesson_count ??
                  ((course.modules ?? []).reduce(
                    (sum, m) => sum + (m.lessons?.length ?? 0),
                    0
                  ) ||
                    (Array.isArray(course.lessons) ? course.lessons.length : 0))}
              </span>
            </div>

            <div className="flex justify-between items-center gap-3">
              <span className="shrink-0">Level:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.level === "Beginner"
                    ? "bg-green-100 text-green-800"
                    : course.level === "Intermediate"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-[#C0EAFF] text-purple-800"
                }`}
              >
                {course.level || "Mixed"}
              </span>
            </div>

            {/* <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span>⭐ {course.rating || 0}</span>
                <span>
                  (
                  {(course.enrolledStudents ||
                    course.students ||
                    0
                  ).toLocaleString()}
                  )
                </span>
              </div>
            </div> */}
          </div>

          {/* DESCRIPTION + ACTION */}
          <div className="mt-4 md:mt-6 flex-1 flex flex-col">
            <p className="text-gray-700 text-xs md:text-sm mb-3 md:mb-4 line-clamp-3">
              {getTextExcerpt(course.description, 160)}
            </p>

            <button
              onClick={() => onCourseSelect(course)}
              className="
                w-full
                px-3 md:px-4
                py-2
                text-sm md:text-base
                font-medium
                rounded-lg
                bg-[#6ED6EE]
                text-white
                hover:bg-purple-700
                transition-colors
              "
            >
              {isPublic ? "View Course" : "View Course"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseGrid;
