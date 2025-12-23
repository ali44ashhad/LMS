// src/components/courses/CoursePlayer.jsx
import React, { useState, useRef } from 'react';
import { useProgress } from '../../hooks/useProgress';
import { formatTime } from '../../utils/helpers';

const CoursePlayer = ({ course, lesson, onComplete, onNext, onPrevious, onExit }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const videoRef = useRef(null);

  const { incrementProgress } = useProgress(course.id);

  // Mock video content based on lesson type
  const getVideoContent = () => {
    if (lesson.type === 'quiz') {
      return {
        type: 'quiz',
        title: 'Test Your Knowledge',
        description: 'Complete this quiz to test your understanding of the concepts covered in this module.'
      };
    } else if (lesson.type === 'assignment') {
      return {
        type: 'assignment',
        title: 'Hands-on Assignment',
        description: 'Apply what you\'ve learned by completing this practical assignment.'
      };
    } else {
      return {
        type: 'video',
        title: 'Video Lesson',
        description: 'Watch this video to learn key concepts and techniques.'
      };
    }
  };

  const videoContent = getVideoContent();

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);

      // Mark as completed if watched 90% of the video
      if (videoRef.current.currentTime / videoRef.current.duration > 0.9) {
        incrementProgress(1);
        onComplete && onComplete();
      }
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleComplete = () => {
    incrementProgress(5); // Complete the lesson
    onComplete && onComplete();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto bg-[#FBFBFB] rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <button 
            onClick={onExit}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <h2>←</h2>
            <h2>Back to Course</h2>
          </button>
          <h1 className="text-xl font-bold ">{lesson.title}</h1>
          <p className="text-[#5E607E]">{course.title}</p>
        </div>
        <div className="text-right">
          <div className="text-sm ">Lesson {lesson.id} of 12</div>
          <div className="text-sm font-medium  ">{videoContent.type.toUpperCase()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Video Player */}
          <div className="bg-black relative">
            {videoContent.type === 'video' && lesson.url ? (
              <>
                {/* YouTube Embed */}
                <div className="w-full bg-black" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                  {lesson.url && lesson.url.includes('youtube') ? (
                    <iframe
                      style={{ position: 'absolute', top: 0, left: 0 }}
                      width="100%"
                      height="100%"
                      src={lesson.url.replace('watch?v=', 'embed/').split('&')[0]}
                      title={lesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      ref={videoRef}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      controls
                      onTimeUpdate={handleTimeUpdate}
                    >
                      <source src={lesson.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                
                {/* Progress Bar - only for non-YouTube videos */}
                {lesson.url && !lesson.url.includes('youtube') && (
                  <div className="absolute bottom-16 left-0 right-0">
                    <div 
                      className="h-1 bg-gray-600 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        handleSeek(percent * duration);
                      }}
                    >
                      <div 
                        className="h-1 bg-red-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Controls - only for non-YouTube videos */}
                {lesson.url && !lesson.url.includes('youtube') && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="text-white hover:text-gray-300"
                        >
                          {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        
                        <span className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <select
                          value={playbackRate}
                          onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                          className="bg-gray-800 text-white text-sm rounded px-2 py-1"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>

                        <div className="flex items-center space-x-2">
                          <button className="text-white hover:text-gray-300">🔊</button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </div>

                        <button 
                          onClick={() => setShowNotes(!showNotes)}
                          className="text-white hover:text-gray-300"
                        >
                          📝
                        </button>

                        <button className="text-white hover:text-gray-300">⛶</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : !lesson.url ? (
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 flex items-center justify-center" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                <div className="text-center text-white absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-6xl mb-4">🎥</div>
                    <p className="text-xl">No Video Available</p>
                    <p className="  mt-2">Video URL not provided for {lesson.title}</p>
                  </div>
                </div>
              </div>
            ) : videoContent.type === 'quiz' ? (
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-6xl mb-6">🧠</div>
                  <h2 className="text-2xl font-bold mb-4">Knowledge Check</h2>
                  <p className=" mb-6">{videoContent.description}</p>
                  <button 
                    onClick={handleComplete}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-6xl mb-6">📝</div>
                  <h2 className="text-2xl font-bold mb-4">Practical Assignment</h2>
                  <p className="  mb-6">{videoContent.description}</p>
                  <button 
                    onClick={handleComplete}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Start Assignment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {showNotes && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes for this lesson..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-3">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Save Notes
                </button>
              </div>
            </div>
          )}
          {/* Lesson Description */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">About This Lesson</h2>
            <div className="prose max-w-none">
              <p className="  mb-4">
                This lesson covers important concepts and techniques that are fundamental to understanding {" "}
                {course.category.toLowerCase()}. You'll learn through practical examples and hands-on exercises.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Key Takeaways</h3>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Understand core concepts and principles</li>
                <li>Learn practical implementation techniques</li>
                <li>Apply knowledge through exercises</li>
                <li>Develop problem-solving skills</li>
              </ul>

          
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 border-l border-gray-200">
          <div className="p-4">
            <h3 className="font-semibold  mb-4">Lesson Navigation</h3>
            
            <div className="space-y-2 mb-6">
              <button
                onClick={onPrevious}
                disabled={lesson.id === 1}
                className="w-full px-3 py-2 text-left bg-lime-400 rounded-lg hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous Lesson
              </button>
              
              <button
                onClick={onNext}
                className="w-full px-3 py-2 text-left bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Next Lesson →
              </button>
            </div>

            {/* <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Quick Actions</h4>
              
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                <span>📖</span>
                <span>View Transcript</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                <span>💬</span>
                <span>Discussion Forum</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                <span>❓</span>
                <span>Ask a Question</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg">
                <span>⭐</span>
                <span>Rate this Lesson</span>
              </button>
            </div> */}

            {/* <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Tip</h4>
              <p className="text-yellow-700 text-sm">
                Take notes while watching to reinforce your learning. You can access your notes anytime from the course dashboard.
              </p>
            </div> */}
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
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
//               className="px-4 py-2 bg-purple-600 text-white rounded"
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
