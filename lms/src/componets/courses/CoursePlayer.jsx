import React, { useState, useRef, useEffect } from "react";
import { useProgress } from "../../hooks/useProgress";
import { formatTime } from "../../utils/helpers";

const CoursePlayer = ({
  course,
  lesson,
  isCompleted = false,
  onComplete,
  onNext,
  onPrevious,
  onExit,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [lessonCompleted, setLessonCompleted] = useState(isCompleted);
  const videoRef = useRef(null);

  const courseId = course?._id || course?.id;
  const { incrementProgress } = useProgress(courseId);

  // Update lessonCompleted when lesson or isCompleted prop changes
  useEffect(() => {
    setLessonCompleted(isCompleted);
    // Reset video state when lesson changes
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [isCompleted, lesson?._id, lesson?.id]);

  const getVideoContent = () => {
    if (lesson.type === "quiz") {
      return {
        type: "quiz",
        title: "Test Your Knowledge",
        description:
          "Complete this quiz to test your understanding of the concepts covered in this module.",
      };
    }
    if (lesson.type === "assignment") {
      return {
        type: "assignment",
        title: "Hands-on Assignment",
        description:
          "Apply what you've learned by completing this practical assignment.",
      };
    }
    return {
      type: "video",
      title: "Video Lesson",
      description: "Watch this video to learn key concepts and techniques.",
    };
  };

  const videoContent = getVideoContent();

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);

    // REMOVED: Automatic completion on 90% watch
    // Lessons should only be marked as complete when user explicitly clicks "Mark as Complete" button
    // This prevents automatic completion when navigating to next lesson
  };

  const handleSeek = (time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const handleVolumeChange = (v) => {
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const handleComplete = async () => {
    // Update local progress
    incrementProgress(5);
    // Call completion handler to sync with backend
    onComplete && onComplete();
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto bg-[#FBFBFB] border rounded-lg shadow-sm">
      {/* HEADER */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div>
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <span>←</span>
            <span>Back to Course</span>
          </button>
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          <p className="text-[#5E607E]">{course.title}</p>
        </div>

        <div className="text-right text-sm">
          <div>Lesson {course.lessons ? course.lessons.findIndex(l => (l._id || l.id) === (lesson._id || lesson.id)) + 1 : 1} of {course.lessons?.length || 1}</div>
          <div className="font-medium">
            {videoContent.type.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* MAIN */}
        <div className="lg:col-span-3">
          <div className="bg-black relative aspect-video">
            {/* VIDEO */}
            {videoContent.type === "video" && lesson.url ? (
              <>
                {lesson.url.includes("youtube") ? (
                  <div className="relative w-full h-full">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={lesson.url
                        .replace("watch?v=", "embed/")
                        .split("&")[0] + "?enablejsapi=1"}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      id={`youtube-iframe-${lesson.id || lesson._id}`}
                    />
                    {/* <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 p-4 text-white text-sm">
                      <div className="flex items-center justify-between">
                        <span>YouTube Video</span>
                        <button
                          onClick={() => {
                            if (!lessonCompleted) {
                              setLessonCompleted(true);
                              incrementProgress(5);
                              onComplete && onComplete();
                            }
                          }}
                          className="px-4 py-2 bg-[#6ED6EE] rounded-lg hover:bg-purple-700"
                        >
                          {lessonCompleted ? "✓ Completed" : "Mark as Complete"}
                        </button>
                      </div>
                    </div> */}
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full"
                    controls
                    onTimeUpdate={handleTimeUpdate}
                  >
                    <source src={lesson.url} type="video/mp4" />
                  </video>
                )}

                {/* PROGRESS BAR */}
                {!lesson.url.includes("youtube") && (
                  <div
                    className="absolute bottom-16 left-0 right-0 h-1 bg-gray-600 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent =
                        (e.clientX - rect.left) / rect.width;
                      handleSeek(percent * duration);
                    }}
                  >
                    <div
                      className="h-1 bg-red-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* CONTROLS */}
                {!lesson.url.includes("youtube") && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-white text-sm">
                        <button onClick={handlePlayPause}>
                          {isPlaying ? "⏸️" : "▶️"}
                        </button>
                        <span>
                          {formatTime(currentTime)} /{" "}
                          {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-white">
                        <select
                          value={playbackRate}
                          onChange={(e) =>
                            handlePlaybackRateChange(
                              parseFloat(e.target.value)
                            )
                          }
                          className="bg-gray-800 rounded px-2 py-1 text-sm"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) =>
                            handleVolumeChange(
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-20"
                        />

                        <button
                          onClick={() => setShowNotes(!showNotes)}
                        >
                          📝
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : videoContent.type === "quiz" ? (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
                <div>
                  <div className="text-6xl mb-6">🧠</div>
                  <h2 className="text-2xl font-bold mb-4">
                    Knowledge Check
                  </h2>
                  <p className="mb-6">
                    {videoContent.description}
                  </p>
                  <button
                    onClick={handleComplete}
                    className="px-6 py-3 bg-[#6ED6EE] rounded-lg hover:bg-purple-700"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
                <div>
                  <div className="text-6xl mb-6">📝</div>
                  <h2 className="text-2xl font-bold mb-4">
                    Practical Assignment
                  </h2>
                  <p className="mb-6">
                    {videoContent.description}
                  </p>
                  <button
                    onClick={handleComplete}
                    className="px-6 py-3 bg-[#6ED6EE] rounded-lg hover:bg-purple-700"
                  >
                    Start Assignment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NOTES */}
          {showNotes && (
            <div className="p-6 border-b">
              <h3 className="font-semibold mb-4">Lesson Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#99DBFF]"
              />
              <div className="flex justify-end mt-3">
                <button className="px-4 py-2 bg-[#6ED6EE] text-white rounded-lg">
                  Save Notes
                </button>
              </div>
            </div>
          )}
 {/* Mark as Complete Button */}
 <div className="p-6 border-t">
              {lessonCompleted ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <span>✓</span>
                  <span>Lesson Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Mark as Complete
                </button>
              )}
            </div>
          {/* DESCRIPTION */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              About This Lesson
            </h2>
            <p className="mb-4 text-gray-600">
              This lesson covers important concepts and techniques that are
              fundamental to understanding{" "}
              {course.category.toLowerCase()}.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Understand core concepts</li>
              <li>Learn practical techniques</li>
              <li>Apply knowledge</li>
              <li>Develop problem-solving skills</li>
            </ul>
            
           
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="border-l p-4">
          <h3 className="font-semibold mb-4">Lesson Navigation</h3>

          <div className="space-y-2">
            <button
              onClick={onPrevious}
              disabled={!onPrevious}
              className="w-full px-3 py-2 bg-lime-400 rounded-lg hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Lesson
            </button>

            <button
              onClick={onNext}
              disabled={!onNext}
              className="w-full px-3 py-2 bg-[#6ED6EE] text-white rounded-lg hover:bg-[#1EAAFF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Lesson →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;



// import React, { useState, useRef } from 'react';
// import { useProgress } from '../../hooks/useProgress';
// import { formatTime } from '../../utils/helpers';

// const CoursePlayer = ({
//   course,
//   lesson,
//   onComplete,
//   onNext,
//   onPrevious,
//   onExit
// }) => {
//   const videoRef = useRef(null);

//   /* ================= FLOATING VIDEO STATE ================= */
//   const [showPlayer, setShowPlayer] = useState(true);
//   const [position, setPosition] = useState({ x: 40, y: 100 });
//   const dragOffset = useRef({ x: 0, y: 0 });

//   /* ================= PROGRESS ================= */
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const { incrementProgress } = useProgress(course.id);

//   /* ================= DRAG LOGIC ================= */
//   const startDrag = (e) => {
//     dragOffset.current = {
//       x: e.clientX - position.x,
//       y: e.clientY - position.y
//     };
//     document.addEventListener('mousemove', onDrag);
//     document.addEventListener('mouseup', stopDrag);
//   };

//   const onDrag = (e) => {
//     setPosition({
//       x: e.clientX - dragOffset.current.x,
//       y: e.clientY - dragOffset.current.y
//     });
//   };

//   const stopDrag = () => {
//     document.removeEventListener('mousemove', onDrag);
//     document.removeEventListener('mouseup', stopDrag);
//   };

//   /* ================= VIDEO HANDLERS ================= */
//   const handleTimeUpdate = () => {
//     if (!videoRef.current) return;

//     setCurrentTime(videoRef.current.currentTime);
//     setDuration(videoRef.current.duration || 0);

//     if (
//       videoRef.current.duration &&
//       videoRef.current.currentTime / videoRef.current.duration > 0.9
//     ) {
//       incrementProgress(1);
//       onComplete && onComplete();
//     }
//   };

//   const isYouTube = lesson?.url?.includes('youtube');
//   const youtubeEmbedUrl = lesson?.url
//     ? lesson.url.replace('watch?v=', 'embed/').split('&')[0]
//     : '';

//   /* ================= UI ================= */
//   return (
//     <>
//       {/* ================= ORIGINAL COURSE UI (UNCHANGED) ================= */}
//       <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
//         {/* Header */}
//         <div className="px-6 py-4 border-b flex justify-between items-center">
//           <div>
//             <button
//               onClick={onExit}
//               className="text-sm text-gray-600 hover:text-gray-900 mb-2"
//             >
//               ← Back to Course
//             </button>
//             <h1 className="text-xl font-bold">{lesson.title}</h1>
//             <p className="text-gray-600">{course.title}</p>
//           </div>

//           <button
//             onClick={() => setShowPlayer(true)}
//             className="px-4 py-2 bg-[#6ED6EE] text-white rounded-lg hover:bg-purple-700"
//           >
//             Open Video
//           </button>
//         </div>

//         {/* Lesson Details */}
//         <div className="p-6">
//           <h2 className="text-lg font-semibold mb-3">About this lesson</h2>
//           <p className="text-gray-700 mb-4">
//             This lesson focuses on key concepts of{' '}
//             <strong>{course.category}</strong>. Watch the video carefully and
//             take notes to reinforce learning.
//           </p>

//           <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
//             <li>Concept overview & explanation</li>
//             <li>Real-world examples</li>
//             <li>Practical tips & best practices</li>
//             <li>Lesson summary</li>
//           </ul>

//           <div className="flex gap-3">
//             <button
//               onClick={onPrevious}
//               disabled={lesson.id === 1}
//               className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             >
//               ← Previous Lesson
//             </button>
//             <button
//               onClick={onNext}
//               className="px-4 py-2 bg-[#6ED6EE] text-white rounded"
//             >
//               Next Lesson →
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ================= FLOATING SMALL IFRAME ================= */}
//       {showPlayer && lesson.url && (
//         <div
//           style={{ left: position.x, top: position.y }}
//           className="
//             fixed z-[9999]
//             w-[460px] h-[290px]
//             bg-black rounded-lg shadow-2xl
//           "
//         >
//           {/* Drag Header */}
//           <div
//             onMouseDown={startDrag}
//             className="
//               h-8 px-3
//               flex items-center justify-between
//               bg-gray-900 text-white
//               cursor-move select-none
//               rounded-t-lg text-xs
//             "
//           >
//             <span className="truncate">{lesson.title}</span>
//             <button
//               onClick={() => setShowPlayer(false)}
//               className="text-red-400 hover:text-red-500"
//             >
//               ✕
//             </button>
//           </div>

//           {/* Video */}
//           <div className="w-full h-[calc(100%-2rem)]">
//             {isYouTube ? (
//               <iframe
//                 src={youtubeEmbedUrl}
//                 title={lesson.title}
//                 className="w-full h-full rounded-b-lg"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//               />
//             ) : (
//               <video
//                 ref={videoRef}
//                 src={lesson.url}
//                 controls
//                 onTimeUpdate={handleTimeUpdate}
//                 className="w-full h-full rounded-b-lg bg-black"
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default CoursePlayer;
