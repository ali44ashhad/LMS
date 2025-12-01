// src/hooks/useProgress.js
import { useState, useEffect } from 'react';
import { useCourseProgress } from './useLocalStorage';

export const useProgress = (courseId) => {
  const { getProgress, updateProgress } = useCourseProgress();
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    setCurrentProgress(getProgress(courseId));
  }, [courseId, getProgress]);

  const incrementProgress = (increment = 1) => {
    const newProgress = Math.min(100, currentProgress + increment);
    setCurrentProgress(newProgress);
    updateProgress(courseId, newProgress);
  };

  const setProgress = (newProgress) => {
    const progress = Math.min(100, Math.max(0, newProgress));
    setCurrentProgress(progress);
    updateProgress(courseId, progress);
  };

  return {
    progress: currentProgress,
    incrementProgress,
    setProgress
  };
};