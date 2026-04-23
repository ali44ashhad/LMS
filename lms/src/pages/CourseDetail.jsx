import React, { useState, useEffect, useMemo, useCallback } from "react";
import CourseDetail from "../componets/courses/CourseDetail";
import CoursePlayer from "../componets/courses/CoursePlayer";
import { enrollmentAPI, courseAPI, authAPI } from "../services/api";

const CourseDetailPage = ({ course, onBack, onEnrollSuccess, isPublic = false }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [subscriptionProfile, setSubscriptionProfile] = useState(null);

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
  
  // Get all lessons in correct order: module 1 (lesson 1,2,3...), then module 2 (lesson 1,2,3...), etc.
  // Do NOT sort globally by order_num (that would mix: m1.l1, m2.l1, m3.l1, m1.l2...).
  const allLessons = React.useMemo(() => {
    const courseData = currentCourse || course;
    let lessonList = [];
    const orderKey = (l) => l.order_num ?? l.order ?? 0;
    if (courseData?.modules && Array.isArray(courseData.modules)) {
      lessonList = courseData.modules.flatMap((mod) => {
        const lessons = mod.lessons ?? [];
        return [...lessons].sort((a, b) => orderKey(a) - orderKey(b));
      });
    }
    if (lessonList.length === 0 && courseData?.lessons && Array.isArray(courseData.lessons)) {
      lessonList = [...courseData.lessons].sort((a, b) => orderKey(a) - orderKey(b));
    }
    return lessonList.map((lesson, idx) => ({
      id: lesson.id ?? lesson._id ?? idx + 1,
      _id: lesson._id ?? lesson.id,
      title: lesson.title || `Lesson ${idx + 1}`,
      duration: lesson.duration || '10 min',
      type: 'video',
      url: lesson.video_url ?? lesson.videoUrl,
      description: lesson.description,
      order: lesson.order_num ?? lesson.order ?? idx + 1,
      resources: lesson.resources || [],
    }));
  }, [currentCourse, course]);

  // Video-only lessons in same order (for Next/Previous in player: 1→2→3… of 8)
  const videoOnlyLessons = useMemo(
    () => allLessons.filter((l) => !!(l.url ?? l.video_url ?? l.videoUrl)),
    [allLessons]
  );

  // Subscription: full access if Creator/Master and subscription not expired
  const hasFullAccess = useMemo(() => {
    if (!subscriptionProfile) return false;
    const plan = subscriptionProfile.planType || "starter_lab";
    if (plan !== "creator_lab" && plan !== "master_lab") return false;
    const endsAt = subscriptionProfile.subscriptionEndsAt;
    if (!endsAt) return false;
    return new Date(endsAt) > new Date();
  }, [subscriptionProfile]);

  // If user is enrolled (admin grant / paid access), unlock the full course regardless of plan fetch issues.
  const hasCourseAccess = useMemo(() => {
    return !!enrollment || hasFullAccess;
  }, [enrollment, hasFullAccess]);

  // First video of first module — the only free lesson for Starter Lab
  const firstFreeLessonId = useMemo(() => {
    const courseData = currentCourse || course;
    if (!courseData?.modules?.length) {
      const flat = courseData?.lessons || [];
      const first = flat.find((l) => !!(l.video_url ?? l.videoUrl));
      return first ? String(first._id ?? first.id) : null;
    }
    for (const mod of courseData.modules) {
      const lessons = mod.lessons ?? [];
      for (const l of lessons) {
        if (l.video_url || l.videoUrl) return String(l._id ?? l.id);
      }
    }
    return null;
  }, [currentCourse, course]);

  const isLessonUnlocked = useCallback(
    (lesson) => {
      if (hasCourseAccess) return true;
      const id = lesson?._id ?? lesson?.id;
      if (!id || !firstFreeLessonId) return false;
      return String(id) === String(firstFreeLessonId);
    },
    [hasCourseAccess, firstFreeLessonId]
  );

  // Fetch Nesta subscription/plan for access control (Starter = first video only; Creator/Master = full access)
  useEffect(() => {
    if (isPublic) {
      setSubscriptionProfile(null);
      return;
    }
    authAPI.getNestaProfile().then(setSubscriptionProfile).catch(() => setSubscriptionProfile(null));
  }, [isPublic]);

  // Fetch enrollment data when course loads (skip when public view)
  useEffect(() => {
    if (isPublic) {
      setEnrollment(null);
      setCompletedLessons([]);
      return;
    }
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
          setCompletedLessons(foundEnrollment.completedLessons ?? foundEnrollment.completed_lessons ?? []);
        }
      } catch (error) {
        console.error("Error fetching enrollment:", error);
      }
    };
    fetchEnrollment();
  }, [courseId, isPublic]);

  // Refresh enrollment after lesson completion
  const refreshEnrollment = async () => {
    if (!courseId) return;
    try {
      console.log('Refreshing enrollment for courseId:', courseId);
      const response = await enrollmentAPI.getMy();
      const foundEnrollment = response.enrollments?.find(
        (e) => {
          const enrollCourseId = e.course?._id || e.course?.id;
          return enrollCourseId?.toString() === courseId?.toString();
        }
      );
      if (foundEnrollment) {
        console.log('Enrollment refreshed:', {
          progress: foundEnrollment.progress,
          completedLessons: foundEnrollment.completedLessons ?? foundEnrollment.completed_lessons
        });
        setEnrollment(foundEnrollment);
        setCompletedLessons(foundEnrollment.completedLessons ?? foundEnrollment.completed_lessons ?? []);
      }
    } catch (error) {
      console.error("Error refreshing enrollment:", error);
    }
  };

  const handleLessonSelect = (lesson) => {
    if (!isLessonUnlocked(lesson)) {
      alert("Upgrade to Creator Lab or Master Lab to unlock all videos. Only the first video of each course is free on Starter Lab.");
      return;
    }
    const index = allLessons.findIndex(
      l => (l._id && lesson._id && l._id.toString() === lesson._id.toString()) ||
           (l.id && lesson.id && l.id.toString() === lesson.id.toString())
    );
    setCurrentLessonIndex(index >= 0 ? index : 0);
    setCurrentLesson(allLessons[index >= 0 ? index : 0] || lesson);
    setIsPlaying(true);
  };

  const handleEnroll = async (enrollCourseId) => {
    // Only students should be able to enroll. Teachers/admins see a message instead of 403 error.
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      storedUser = null;
    }

    const roles = Array.isArray(storedUser?.roles) ? storedUser.roles : [];
    const isAdmin = roles.includes('ROLE_ADMIN');
    const isTeacher = roles.includes('ROLE_TEACHER');

    // Block only admins/teachers; everyone else can attempt enroll (backend still enforces ROLE_STUDENT)
    if (isAdmin || isTeacher) {
      alert('Sirf students courses me enroll kar sakte hain.');
      return;
    }

    try {
      setEnrolling(true);
      const response = await enrollmentAPI.enroll(enrollCourseId);
      const raw = response.enrollment;
      setEnrollment({
        ...raw,
        id: raw?.id ?? raw?._id,
        _id: raw?._id ?? raw?.id,
        course: raw?.course ?? { id: enrollCourseId, _id: enrollCourseId },
        completedLessons: raw?.completedLessons ?? raw?.completed_lessons ?? [],
        lastAccessed: raw?.lastAccessed ?? raw?.last_accessed,
      });
      alert("Successfully enrolled in course!");
      onEnrollSuccess && onEnrollSuccess();
    } catch (error) {
      console.error("Error enrolling:", error);
      const msg = error?.message || '';
      if (msg.includes('Student access required')) {
        alert('Sirf students courses me enroll kar sakte hain.');
      } else {
        alert("Failed to enroll in course");
      }
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
        enrollmentId: enrollment.id ?? enrollment._id,
        lessonId,
        totalLessons,
        completedCount: effectiveCompletedCount,
        newProgress
      });
      
      // Update local state BEFORE making API call
      setCompletedLessons(updatedCompletedLessons);
      setEnrollment({ 
        ...enrollment, 
        progress: newProgress, 
        completedLessons: updatedCompletedLessons,
        lastAccessed: new Date()
      });

      // Update backend: PATCH with { lessonId } (backend appends to completed_lessons and recalculates progress)
      const enrollmentId = enrollment.id ?? enrollment._id;
      const response = await enrollmentAPI.updateProgress(enrollmentId, {
        lessonId
      });
      
      if (!response || !response.success) {
        throw new Error("Failed to update progress on server");
      }
      
      console.log("Lesson completed and progress updated successfully:", newProgress);
      
      // Refresh enrollment data to ensure sync and get latest state from server
      await refreshEnrollment();
      
      // Notify sidebar/dashboard to refresh progress so they show same % as this page
      window.dispatchEvent(new CustomEvent('lms-progress-updated'));
      
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
    const currentId = currentLesson?._id ?? currentLesson?.id;
    const videoIndex = videoOnlyLessons.findIndex(
      (l) => String(l._id ?? l.id) === String(currentId)
    );
    if (videoIndex >= 0 && videoIndex < videoOnlyLessons.length - 1) {
      const nextVideo = videoOnlyLessons[videoIndex + 1];
      if (!isLessonUnlocked(nextVideo)) {
        alert("Upgrade to Creator Lab or Master Lab to unlock the next video.");
        return;
      }
      const indexInAll = allLessons.findIndex(
        (l) => String(l._id ?? l.id) === String(nextVideo._id ?? nextVideo.id)
      );
      if (indexInAll >= 0) {
        setCurrentLessonIndex(indexInAll);
        setCurrentLesson(allLessons[indexInAll]);
      }
    }
  };

  const handlePreviousLesson = () => {
    const currentId = currentLesson?._id ?? currentLesson?.id;
    const videoIndex = videoOnlyLessons.findIndex(
      (l) => String(l._id ?? l.id) === String(currentId)
    );
    if (videoIndex > 0) {
      const prevVideo = videoOnlyLessons[videoIndex - 1];
      const indexInAll = allLessons.findIndex(
        (l) => String(l._id ?? l.id) === String(prevVideo._id ?? prevVideo.id)
      );
      if (indexInAll >= 0) {
        setCurrentLessonIndex(indexInAll);
        setCurrentLesson(allLessons[indexInAll]);
      }
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
    if (!isLessonUnlocked(currentLesson)) {
      return (
        <div className="max-w-2xl mx-auto p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lesson locked</h2>
          <p className="text-gray-600 mb-4">
            Upgrade to Creator Lab or Master Lab to unlock all videos. Only the first video of each course is free on Starter Lab.
          </p>
          <button
            type="button"
            onClick={handleExitPlayer}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Back to course
          </button>
        </div>
      );
    }
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
        canMarkComplete={!!enrollment}
        onEnroll={handleEnroll}
      />
    );
  }

  return (
    <CourseDetail
      course={currentCourse || course}
      onBack={onBack}
      onLessonSelect={handleLessonSelect}
      onEnroll={isPublic ? null : handleEnroll}
      enrolling={enrolling}
      enrollment={enrollment}
      completedLessons={completedLessons}
      allLessons={allLessons}
      isPublic={isPublic}
      isLessonUnlocked={isLessonUnlocked}
    />
  );
};

export default CourseDetailPage;