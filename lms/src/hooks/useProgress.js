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
          (e) => e.course?._id === courseId || e.course?._id?.toString() === courseId?.toString()
        );
        
        if (enrollment) {
          setEnrollmentId(enrollment._id);
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
    
    // Sync to backend if enrollment exists
    if (enrollmentId) {
      try {
        await enrollmentAPI.updateProgress(enrollmentId, {
          progress: newProgress
        });
      } catch (error) {
        console.error('Error updating progress on backend:', error);
      }
    }
  };

  const setProgress = async (newProgress) => {
    const progress = Math.min(100, Math.max(0, newProgress));
    setCurrentProgress(progress);
    updateProgress(courseId, progress);
    
    // Sync to backend if enrollment exists
    if (enrollmentId) {
      try {
        await enrollmentAPI.updateProgress(enrollmentId, {
          progress: progress
        });
      } catch (error) {
        console.error('Error updating progress on backend:', error);
      }
    }
  };

  return {
    progress: currentProgress,
    incrementProgress,
    setProgress,
    loading
  };
};