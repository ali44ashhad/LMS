// src/components/courses/CourseCard.jsx
import React from "react";

const CourseCard = ({ course, onSelect }) => {
  const getGradient = (progress) => {
    if (progress >= 75) return "from-lime-400 via-lime-300 to-lime-500";
    if (progress >= 50) return "from-cyan-400 via-cyan-300 to-cyan-500";
    if (progress >= 25) return "from-amber-400 via-yellow-300 to-amber-500";
    return "from-rose-400 via-red-300 to-rose-500";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not accessed yet";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const progress = course.progress ?? 0;

  return (
    <div
      onClick={() => onSelect && onSelect(course)}
      className="
        cursor-pointer p-4 md:p-5 rounded-xl
        bg-white/80 backdrop-blur
        border border-slate-200
        shadow-sm hover:shadow-md
        transition-all duration-200
      "
    >
      {/* Top ribbon */}
      <div className="flex items-center justify-between mb-3 text-[10px] md:text-xs">
        <span className="px-2 py-0.5 rounded-full border border-slate-300 text-slate-500 uppercase tracking-wider">
          Quest {course.questIndex || "#"}
        </span>
        {course.category && (
          <span className="px-2 py-0.5 rounded-full border border-slate-300 text-slate-500 uppercase tracking-wider">
            {course.category}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className="text-3xl md:text-4xl">
            {course.image || "🎮"}
          </div>

          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-slate-800">
              {course.title}
            </h3>

            <p className="text-slate-400 mt-1 text-xs md:text-sm">
              {course.instructorName || course.instructor || "Instructor"}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] md:text-xs text-slate-400">
              {course.duration && <span>{course.duration}</span>}
              <span>•</span>
              <span>{course.lessons?.length || 0} lessons</span>
              <span>•</span>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.16em] border
                  ${
                    course.level === "Beginner"
                      ? "bg-lime-500/15 text-lime-600 border-lime-400/60"
                      : course.level === "Intermediate"
                      ? "bg-cyan-500/15 text-cyan-600 border-cyan-400/60"
                      : "bg-purple-500/15 text-purple-600 border-purple-400/60"
                  }
                `}
              >
                {course.level || "Mixed"}
              </span>
            </div>
          </div>
        </div>

        {course.enrolled && (
          <div className="text-right ml-4 min-w-[90px]">
            <span className="text-xs md:text-sm font-semibold text-slate-700">
              {progress}% Sync
            </span>
            <div className="w-24 md:w-28 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getGradient(
                  progress
                )}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {course.enrolled && (
        <>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] md:text-xs mb-1">
              <span className="text-slate-400 uppercase tracking-[0.18em]">
                Course Progress
              </span>
              <span className="text-cyan-600 font-semibold">
                {progress}% XP
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getGradient(
                  progress
                )} transition-all duration-300`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] md:text-xs">
            <span className="text-slate-400">
              Last accessed: {formatDate(course.lastAccessed)}
            </span>

            <button className="
              px-3 py-1 rounded-md
              bg-purple-600 text-white
              hover:bg-purple-700
              transition-colors
              uppercase tracking-[0.18em]
            ">
              Resume Quest
            </button>
          </div>
        </>
      )}

      {!course.enrolled && (
        <div className="mt-4 flex items-center justify-between text-[10px] md:text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>⭐ {course.rating || 4.5}</span>
            <span>•</span>
            <span>👥 {course.enrolledStudents || 0} players</span>
          </div>

          <button className="
            px-3 py-1 rounded-md
            bg-purple-600 text-white
            hover:bg-purple-700
            transition-colors
            uppercase tracking-[0.18em]
          ">
            Enroll Quest
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
