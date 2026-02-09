// src/hooks/useProgress.js
import { useState, useEffect } from 'react';
import { useCourseProgress } from './useLocalStorage';
import { enrollmentAPI } from '../services/api';

export const useProgress = (courseId) => {
  const { getProgress, updateProgress } = useCourseProgress();
  const [currentProgress, setCurrentProgress] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch enrollment data and sync progress from backend
  useEffect(() => {
    const fetchEnrollmentProgress = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        const response = await enrollmentAPI.getMy();
        const enrollment = response.enrollments?.find(
          (e) => {
            const enrollCourseId = e.course?.id ?? e.course?._id ?? e.course_id;
            return enrollCourseId != null && String(enrollCourseId) === String(courseId);
          }
        );
        
        if (enrollment) {
          setEnrollmentId(enrollment.id ?? enrollment._id);
          const backendProgress = enrollment.progress || 0;
          setCurrentProgress(backendProgress);
          // Sync to localStorage
          updateProgress(courseId, backendProgress);
        } else {
          // Fallback to localStorage if no enrollment found
          const localProgress = getProgress(courseId);
          setCurrentProgress(localProgress);
        }
      } catch (error) {
        console.error('Error fetching enrollment progress:', error);
        // Fallback to localStorage on error
        const localProgress = getProgress(courseId);
        setCurrentProgress(localProgress);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentProgress();
  }, [courseId, getProgress, updateProgress]);

  const incrementProgress = async (increment = 1) => {
    const newProgress = Math.min(100, currentProgress + increment);
    setCurrentProgress(newProgress);
    updateProgress(courseId, newProgress);
    // Backend only updates progress when a lesson is completed (lessonId); no-op here for backend
  };

  const setProgress = async (newProgress) => {
    const progress = Math.min(100, Math.max(0, newProgress));
    setCurrentProgress(progress);
    updateProgress(courseId, progress);
    // Backend only updates progress when a lesson is completed (lessonId); no-op here for backend
  };

  return {
    progress: currentProgress,
    incrementProgress,
    setProgress,
    loading
  };
};