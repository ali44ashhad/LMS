import React, { useState, useEffect } from "react";
import CourseDetail from "../componets/courses/CourseDetail";
import CoursePlayer from "../componets/courses/CoursePlayer";
import { enrollmentAPI, courseAPI } from "../services/api";

const CourseDetailPage = ({ course, onBack, onEnrollSuccess }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const courseId = course?._id || course?.id || currentCourse?._id || currentCourse?.id;
  
  // Fetch latest course data from server when component mounts or courseId changes
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        console.log("CourseDetailPage: No courseId available");
        return;
      }
      
      try {
        setLoadingCourse(true);
        console.log("CourseDetailPage: Fetching course with ID:", courseId);
        const response = await courseAPI.getById(courseId);
        console.log("CourseDetailPage: API Response:", response);
        
        if (response && response.course) {
          console.log("CourseDetailPage: Setting course data:", response.course.description?.substring(0, 50));
          setCurrentCourse(response.course);
          setLastFetchTime(Date.now());
        } else if (response && response.success && response.course) {
          // Alternative response structure
          console.log("CourseDetailPage: Setting course data (alt structure)");
          setCurrentCourse(response.course);
          setLastFetchTime(Date.now());
        } else {
          console.warn("CourseDetailPage: Unexpected response structure:", response);
          // Fallback to prop course if API response is unexpected
          if (course) {
            setCurrentCourse(course);
          }
        }
      } catch (error) {
        console.error("CourseDetailPage: Error fetching course:", error);
        // If fetch fails, use the prop course as fallback
        if (course) {
          console.log("CourseDetailPage: Using fallback course from prop");
          setCurrentCourse(course);
        }
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Set initial course from prop only if we don't have fetched data yet
  useEffect(() => {
    if (course && !currentCourse && !lastFetchTime) {
      // Only use prop course as initial fallback before fetch completes
      setCurrentCourse(course);
    }
  }, [course]);
  
  // Refresh course data when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && courseId && lastFetchTime) {
        // Refresh if more than 30 seconds have passed since last fetch
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        if (timeSinceLastFetch > 30000) {
          console.log("CourseDetailPage: Page visible, refreshing course data");
          const fetchCourse = async () => {
            try {
              const response = await courseAPI.getById(courseId);
              if (response && response.course) {
                setCurrentCourse(response.course);
                setLastFetchTime(Date.now());
              }
            } catch (error) {
              console.error("CourseDetailPage: Error refreshing course:", error);
            }
          };
          fetchCourse();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, lastFetchTime]);
  
  // Get all lessons from course
  const allLessons = React.useMemo(() => {
    const courseData = currentCourse || course;
    if (courseData?.lessons && Array.isArray(courseData.lessons)) {
      return courseData.lessons.map((lesson, idx) => ({
        id: lesson._id || lesson.id || idx + 1,
        _id: lesson._id || lesson.id,
        title: lesson.title || `Lesson ${idx + 1}`,
        duration: lesson.duration || '10 min',
        type: 'video',
        url: lesson.videoUrl,
        description: lesson.description,
        order: lesson.order || idx + 1,
      }));
    }
    return [];
  }, [currentCourse, course]);

  // Fetch enrollment data when course loads
  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!courseId) return;
      
      try {
        const response = await enrollmentAPI.getMy();
        const foundEnrollment = response.enrollments?.find(
          (e) => {
            const enrollCourseId = e.course?._id || e.course?.id;
            return enrollCourseId?.toString() === courseId?.toString();
          }
        );
        if (foundEnrollment) {
          setEnrollment(foundEnrollment);
          setCompletedLessons(foundEnrollment.completedLessons || []);
        }
      } catch (error) {
        console.error("Error fetching enrollment:", error);
      }
    };

    fetchEnrollment();
  }, [courseId]);

  // Refresh enrollment after lesson completion
  const refreshEnrollment = async () => {
    if (!courseId) return;
    try {
      const response = await enrollmentAPI.getMy();
      const foundEnrollment = response.enrollments?.find(
        (e) => {
          const enrollCourseId = e.course?._id || e.course?.id;
          return enrollCourseId?.toString() === courseId?.toString();
        }
      );
      if (foundEnrollment) {
        setEnrollment(foundEnrollment);
        setCompletedLessons(foundEnrollment.completedLessons || []);
      }
    } catch (error) {
      console.error("Error refreshing enrollment:", error);
    }
  };

  const handleLessonSelect = (lesson) => {
    const index = allLessons.findIndex(
      l => (l._id && lesson._id && l._id.toString() === lesson._id.toString()) ||
           (l.id && lesson.id && l.id.toString() === lesson.id.toString())
    );
    setCurrentLessonIndex(index >= 0 ? index : 0);
    setCurrentLesson(allLessons[index >= 0 ? index : 0] || lesson);
    setIsPlaying(true);
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(true);
      const response = await enrollmentAPI.enroll(courseId);
      setEnrollment(response.enrollment);
      alert("Successfully enrolled in course!");
      onEnrollSuccess && onEnrollSuccess();
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!enrollment || !currentLesson) {
      console.warn("Cannot complete lesson: enrollment or lesson missing", { enrollment: !!enrollment, lesson: !!currentLesson });
      return;
    }

    try {
      const lessonId = currentLesson._id || currentLesson.id;
      if (!lessonId) {
        console.error("Lesson ID is missing");
        return;
      }

      const totalLessons = allLessons.length || 1;
      if (totalLessons === 0) {
        console.error("No lessons found in course");
        return;
      }
      
      // Add lesson to completed lessons if not already completed
      const lessonIdStr = lessonId?.toString();
      const isAlreadyCompleted = completedLessons.some(
        id => {
          const idStr = id?.toString();
          return idStr === lessonIdStr;
        }
      );
      
      const updatedCompletedLessons = isAlreadyCompleted
        ? completedLessons
        : [...completedLessons, lessonId];

      // Build a set of valid lesson IDs for this course to avoid counting old/invalid IDs
      const validLessonIdSet = new Set(
        allLessons
          .map(l => (l._id || l.id))
          .filter(Boolean)
          .map(id => id.toString())
      );

      // Count only those completed lessons that belong to the current course lessons
      const effectiveCompletedCount = updatedCompletedLessons.reduce((count, id) => {
        const idStr = id?.toString();
        return validLessonIdSet.has(idStr) ? count + 1 : count;
      }, 0);

      // Calculate new progress and clamp between 0 and 100
      const rawProgress = (effectiveCompletedCount / totalLessons) * 100;
      const newProgress = Math.max(0, Math.min(100, Math.round(rawProgress)));
      
      console.log("Updating progress:", {
        enrollmentId: enrollment._id,
        lessonId,
        totalLessons,
        completedCount: effectiveCompletedCount,
        newProgress
      });
      
      // Update backend
      const response = await enrollmentAPI.updateProgress(enrollment._id, {
        progress: newProgress,
        completedLessons: updatedCompletedLessons
      });
      
      if (!response || !response.success) {
        throw new Error("Failed to update progress on server");
      }
      
      // Update local state
      setCompletedLessons(updatedCompletedLessons);
      setEnrollment({ 
        ...enrollment, 
        progress: newProgress, 
        completedLessons: updatedCompletedLessons,
        lastAccessed: new Date()
      });
      
      console.log("Lesson completed and progress updated successfully:", newProgress);
      
      // Refresh enrollment data to ensure sync
      await refreshEnrollment();
      
      // Show success message
      alert("Lesson marked as complete!");
      
      // REMOVED: Auto-navigation to next lesson
      // User should manually navigate to next lesson when ready
    } catch (error) {
      console.error("Error updating lesson completion:", error);
      alert("Failed to update progress. Please try again.");
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextIndex);
      setCurrentLesson(allLessons[nextIndex]);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevIndex = currentLessonIndex - 1;
      setCurrentLessonIndex(prevIndex);
      setCurrentLesson(allLessons[prevIndex]);
    }
  };

  const handleExitPlayer = () => {
    setIsPlaying(false);
    setCurrentLesson(null);
  };

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading course details...</div>
      </div>
    );
  }

  if (isPlaying && currentLesson) {
    // Check if current lesson is already completed
    const currentLessonId = currentLesson._id || currentLesson.id;
    const isCurrentLessonCompleted = completedLessons.some(
      id => id?.toString() === currentLessonId?.toString()
    );
    
    return (
      <CoursePlayer
        course={currentCourse || course}
        lesson={currentLesson}
        isCompleted={isCurrentLessonCompleted}
        onComplete={handleLessonComplete}
        onNext={handleNextLesson}
        onPrevious={handlePreviousLesson}
        onExit={handleExitPlayer}
      />
    );
  }

  return (
    <CourseDetail
      course={currentCourse || course}
      onBack={onBack}
      onLessonSelect={handleLessonSelect}
      onEnroll={handleEnroll}
      enrolling={enrolling}
      enrollment={enrollment}
      completedLessons={completedLessons}
      allLessons={allLessons}
    />
  );
};

export default CourseDetailPage;
