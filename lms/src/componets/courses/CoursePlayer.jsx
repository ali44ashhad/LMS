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
    // Update local UI state immediately
    setLessonCompleted(true);
    // Call completion handler to sync with backend (and it will update the parent state)
    onComplete && onComplete();
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Function to clean up lesson description - remove "Module X: Title" prefix if present
  const cleanLessonDescription = (desc) => {
    if (!desc) return desc;
    // Remove "Module X: ..." prefix that may have been added in the past
    // Pattern: "Module 1:", "Module 2:", etc.
    const cleanedDesc = desc.replace(/^Module\s+\d+:\s*[^\n]*\n+/i, '');
    return cleanedDesc;
  };

  // CSS for cleaning up Quill HTML in lesson descriptions
  const descriptionStyles = `
    .lesson-description {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #374151;
    }
    .lesson-description h1,
    .lesson-description h2,
    .lesson-description h3,
    .lesson-description h4,
    .lesson-description h5,
    .lesson-description h6 { 
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
      color: #1f2937;
    }
    .lesson-description h1 { font-size: 1.5rem; }
    .lesson-description h2 { font-size: 1.25rem; }
    .lesson-description h3 { font-size: 1.1rem; }
    .lesson-description p { 
      margin: 0.75rem 0;
    }
    .lesson-description ol,
    .lesson-description ul { 
      margin: 1rem 0;
      padding-left: 2.5rem;
      list-style-position: outside;
    }
    .lesson-description ol {
      list-style-type: decimal;
    }
    .lesson-description ul {
      list-style-type: disc;
    }
    .lesson-description li { 
      margin: 0.5rem 0;
      display: list-item;
    }
    .lesson-description strong {
      font-weight: 600;
      background-color: transparent !important;
    }
    .lesson-description em {
      font-style: italic;
    }
    .lesson-description a {
      color: #0891b2;
      text-decoration: underline;
    }
    .lesson-description a:hover {
      color: #0e7490;
    }
    /* Remove inline background colors from Quill styling */
    .lesson-description span[style*="background-color"] {
      background-color: transparent !important;
    }
  `;

  return (
    <div className="max-w-6xl mx-auto bg-[#FBFBFB] border rounded-lg shadow-sm">
      <style>{descriptionStyles}</style>
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
             
            {lesson.description ? (
              <>
                <div 
                  className="lesson-description mb-4"
                  dangerouslySetInnerHTML={{ __html: cleanLessonDescription(lesson.description) }}
                />
                {lesson.learningPoints && Array.isArray(lesson.learningPoints) && lesson.learningPoints.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {lesson.learningPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )  : null}
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-600">
                  This lesson covers important concepts and techniques that are
                  fundamental to understanding {course.category.toLowerCase()}.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Understand core concepts</li>
                  <li>Learn practical techniques</li>
                  <li>Apply knowledge</li>
                  <li>Develop problem-solving skills</li>
                </ul>
              </>
            )}
          </div>

          {/* FILES & RESOURCES */}
          {(() => {
            console.log('CoursePlayer: Lesson resources:', lesson.resources);
            return lesson.resources && Array.isArray(lesson.resources) && lesson.resources.length > 0;
          })() && (
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Files & Resources</h2>
              <div className="space-y-4">
                {lesson.resources.map((resource, index) => {
                  console.log(`CoursePlayer: Resource ${index}:`, resource);
                  return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
                      <div className="text-2xl">
                        {resource.type === 'pdf' ? '📄' : '📎'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {resource.title || 'Resource'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {resource.type?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                    </div>
                    {resource.type === 'pdf' ? (
                      <div className="w-full" style={{ height: '600px' }}>
                        {(() => {
                          // Normalize URL: Fix old URLs with %20 and wrong folder path
                          let pdfUrl = resource.url;
                          
                          // Check if URL has old format issues
                          const hasOldFormat = pdfUrl.includes('%20') || pdfUrl.includes('/lms/') && !pdfUrl.includes('/lms/course-resources/');
                          
                          if (hasOldFormat) {
                            console.warn('CoursePlayer: Old URL format detected, attempting to fix:', pdfUrl);
                            
                            // Try to fix: replace %20 with hyphens and fix folder path
                            pdfUrl = pdfUrl
                              .replace(/%20/g, '-') // Replace %20 with hyphens
                              .replace(/\/lms\/(?!course-resources)/, '/lms/course-resources/'); // Fix folder path
                            
                            console.log('CoursePlayer: Fixed URL:', pdfUrl);
                          }
                          
                          console.log('CoursePlayer: Rendering PDF with URL:', pdfUrl);
                          
                          return (
                            <>
                              {/* Show warning if old format was detected */}
                              {hasOldFormat && (
                                <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                  ⚠️ This PDF was uploaded with an old format. If it doesn't load, please re-upload it from the admin panel.
                                </div>
                              )}
                              
                              {/* Use Google Docs Viewer for reliable PDF display */}
                              <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                                className="w-full h-full border-0"
                                title={resource.title || 'PDF Viewer'}
                                style={{ border: 'none' }}
                                onError={(e) => {
                                  console.error('PDF iframe error:', e, 'URL:', pdfUrl);
                                }}
                                onLoad={() => {
                                  console.log('PDF iframe loaded successfully');
                                }}
                              />
                              
                              {/* Fallback: Direct link */}
                              <div className="mt-2 text-center p-2 bg-gray-50 text-xs">
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  Open PDF directly
                                </a>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="p-4">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors inline-block"
                        >
                          Open Resource
                        </a>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}
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
