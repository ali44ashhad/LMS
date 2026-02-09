// src/hooks/useRealTimeProgress.js
import { useState, useEffect, useCallback } from 'react';
import { enrollmentAPI, courseAPI } from '../services/api';

// Compute progress on frontend: only video lessons count (exclude resource-only lessons)
function computeProgressForEnrollment(enrollment, course) {
  if (!course || !enrollment) return 0;
  const modules = course.modules || [];
  const completedIds = new Set(
    (enrollment.completed_lessons || enrollment.completedLessons || [])
      .map((id) => String(id))
  );
  let totalVideo = 0;
  let completedVideo = 0;
  modules.forEach((mod) => {
    (mod.lessons || []).forEach((lesson) => {
      const hasVideo = !!(lesson.video_url ?? lesson.videoUrl);
      if (!hasVideo) return;
      totalVideo += 1;
      const lid = lesson.id ?? lesson._id;
      if (lid != null && completedIds.has(String(lid))) completedVideo += 1;
    });
  });
  if (totalVideo === 0) return 0;
  return Math.min(100, Math.round((completedVideo / totalVideo) * 100));
}

export const useRealTimeProgress = (enabled = true, pollInterval = 2000) => {
  const [progressData, setProgressData] = useState({
    overallProgress: 0,
    completedCourses: 0,
    totalCourses: 0,
    enrollments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgressData = useCallback(async () => {
    try {
      const response = await enrollmentAPI.getMy();
      const enrollments = response.enrollments || [];
      const totalCourses = enrollments.length;

      // Compute progress per enrollment on frontend (no backend progress used)
      const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (e) => {
          const courseId = e.course_id ?? e.course?.id ?? e.course?._id;
          if (!courseId) return { ...e, progress: 0 };
          try {
            const cr = await courseAPI.getById(courseId);
            const course = cr.course ?? cr;
            const progress = computeProgressForEnrollment(e, course);
            return { ...e, progress };
          } catch {
            return { ...e, progress: 0 };
          }
        })
      );

      const completedCourses = enrollmentsWithProgress.filter((e) => e.progress === 100).length;
      const overallProgress =
        totalCourses > 0
          ? Math.round(
              enrollmentsWithProgress.reduce((acc, e) => acc + (e.progress || 0), 0) / totalCourses
            )
          : 0;

      setProgressData({
        overallProgress,
        completedCourses,
        totalCourses,
        enrollments: enrollmentsWithProgress
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching real-time progress data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchProgressData();
    }
  }, [enabled, fetchProgressData]);

  // Setup polling
  useEffect(() => {
    if (!enabled) return;

    const pollInterval_ = setInterval(() => {
      fetchProgressData();
    }, pollInterval);

    return () => clearInterval(pollInterval_);
  }, [enabled, pollInterval, fetchProgressData]);

  // Refresh when progress is updated elsewhere (e.g. lesson completed on course detail)
  useEffect(() => {
    if (!enabled) return;
    const onProgressUpdated = () => fetchProgressData();
    window.addEventListener('lms-progress-updated', onProgressUpdated);
    return () => window.removeEventListener('lms-progress-updated', onProgressUpdated);
  }, [enabled, fetchProgressData]);

  return {
    ...progressData,
    loading,
    error,
    refresh: fetchProgressData
  };
};
