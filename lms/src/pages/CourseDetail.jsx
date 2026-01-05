import React, { useState, useEffect } from "react";
import CourseDetail from "../componets/courses/CourseDetail";
import CoursePlayer from "../componets/courses/CoursePlayer";
import { enrollmentAPI } from "../services/api";

const CourseDetailPage = ({ course, onBack, onEnrollSuccess }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  const courseId = course?._id || course?.id;
  
  // Get all lessons from course
  const allLessons = React.useMemo(() => {
    if (course?.lessons && Array.isArray(course.lessons)) {
      return course.lessons.map((lesson, idx) => ({
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
  }, [course]);

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
      
      // Calculate new progress
      const newProgress = Math.round((updatedCompletedLessons.length / totalLessons) * 100);
      
      console.log("Updating progress:", {
        enrollmentId: enrollment._id,
        lessonId,
        totalLessons,
        completedCount: updatedCompletedLessons.length,
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
      
      // Auto-navigate to next lesson if available
      if (currentLessonIndex < allLessons.length - 1) {
        setTimeout(() => {
          handleNextLesson();
        }, 1500);
      }
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

  if (isPlaying && currentLesson) {
    return (
      <CoursePlayer
        course={course}
        lesson={currentLesson}
        onComplete={handleLessonComplete}
        onNext={handleNextLesson}
        onPrevious={handlePreviousLesson}
        onExit={handleExitPlayer}
      />
    );
  }

  return (
    <CourseDetail
      course={course}
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
