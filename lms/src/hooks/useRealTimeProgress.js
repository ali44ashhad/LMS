// src/hooks/useRealTimeProgress.js
import { useState, useEffect, useCallback } from 'react';
import { enrollmentAPI, courseAPI } from '../services/api';

// ---- Global poller (dedupes network calls across multiple hook users) ----
let _cache = {
  overallProgress: 0,
  completedCourses: 0,
  totalCourses: 0,
  enrollments: []
};
let _cacheLoading = true;
let _cacheError = null;
let _inFlight = null;
let _timerId = null;
let _activeUsers = 0;
let _currentInterval = 2000;
const _listeners = new Set();

const _emit = () => {
  for (const fn of _listeners) fn();
};

const _fetchOnce = async () => {
  if (_inFlight) return _inFlight;
  _cacheLoading = true;
  _cacheError = null;
  _emit();

  _inFlight = (async () => {
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

      _cache = {
        overallProgress,
        completedCourses,
        totalCourses,
        enrollments: enrollmentsWithProgress
      };
      _cacheError = null;
    } catch (err) {
      console.error('Error fetching real-time progress data:', err);
      _cacheError = err?.message || String(err);
    } finally {
      _cacheLoading = false;
      _emit();
      _inFlight = null;
    }
  })();

  return _inFlight;
};

const DEFAULT_POLL_MS =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD) ? 15000 : 2000;

const _ensurePolling = (interval) => {
  const nextInterval = Number(interval) > 0 ? Number(interval) : DEFAULT_POLL_MS;

  // If there are no active users, ensure timer is stopped.
  if (_activeUsers <= 0) {
    if (_timerId) clearInterval(_timerId);
    _timerId = null;
    _currentInterval = nextInterval;
    return;
  }

  // If timer doesn't exist or interval changed, recreate it.
  if (_timerId == null || _currentInterval !== nextInterval) {
    if (_timerId) clearInterval(_timerId);
    _currentInterval = nextInterval;
    _timerId = setInterval(() => {
      _fetchOnce();
    }, _currentInterval);
  }
};

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

export const useRealTimeProgress = (enabled = true, pollInterval = DEFAULT_POLL_MS) => {
  const [progressData, setProgressData] = useState(_cache);
  const [loading, setLoading] = useState(_cacheLoading);
  const [error, setError] = useState(_cacheError);

  const refresh = useCallback(async () => {
    await _fetchOnce();
  }, []);

  // Subscribe this hook instance to global cache updates
  useEffect(() => {
    const onUpdate = () => {
      setProgressData(_cache);
      setLoading(_cacheLoading);
      setError(_cacheError);
    };
    _listeners.add(onUpdate);
    // sync immediately
    onUpdate();
    return () => {
      _listeners.delete(onUpdate);
    };
  }, []);

  // Manage polling lifecycle (reference counted)
  useEffect(() => {
    if (!enabled) return;

    _activeUsers += 1;
    _ensurePolling(pollInterval);
    _fetchOnce();

    return () => {
      _activeUsers -= 1;
      if (_activeUsers < 0) _activeUsers = 0;
      _ensurePolling(pollInterval);
    };
  }, [enabled, pollInterval]);

  // Refresh when progress is updated elsewhere (e.g. lesson completed on course detail)
  useEffect(() => {
    if (!enabled) return;
    const onProgressUpdated = () => _fetchOnce();
    window.addEventListener('lms-progress-updated', onProgressUpdated);
    return () => window.removeEventListener('lms-progress-updated', onProgressUpdated);
  }, [enabled]);

  return { ...progressData, loading, error, refresh };
};
