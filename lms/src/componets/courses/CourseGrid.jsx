import React from "react";
import CourseCard from "./CourseCard";

const CourseGrid = ({ courses, onCourseSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
          "
        >
          {/* TOP */}
          <div className="text-center mb-4">
            <div className="text-3xl md:text-4xl mb-2">
              {course.image}
            </div>

            <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
              {course.title}
            </h3>

            <p className="text-gray-600 text-xs md:text-sm mt-1">
              {course.instructorName || course.instructor}
            </p>
          </div>

          {/* META INFO */}
          <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">
                {course.duration || "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Lessons:</span>
              <span className="font-medium">
                {course.modules?.length ||
                  (Array.isArray(course.lessons)
                    ? course.lessons.length
                    : 0)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Level:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.level === "Beginner"
                    ? "bg-green-100 text-green-800"
                    : course.level === "Intermediate"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {course.level}
              </span>
            </div>

            <div className="flex justify-between items-center">
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
            </div>
          </div>

          {/* DESCRIPTION + ACTION */}
          <div className="mt-4 md:mt-6">
            <p className="text-gray-700 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
              {course.description}
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
                bg-purple-600
                text-white
                hover:bg-purple-700
                transition-colors
              "
            >
              View Course
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseGrid;
