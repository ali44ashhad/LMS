// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Handle null, undefined, or invalid JSON strings
      if (!item || item === 'undefined' || item === 'null') {
        return initialValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // If parsing fails, remove the invalid value and return initial
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        // Ignore removal errors
      }
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export const useCourseProgress = () => {
  const [progress, setProgress] = useLocalStorage('courseProgress', {});

  const updateProgress = (courseId, newProgress) => {
    setProgress(prev => ({
      ...prev,
      [courseId]: Math.max(prev[courseId] || 0, newProgress)
    }));
  };

  const getProgress = (courseId) => {
    return progress[courseId] || 0;
  };

  const markLessonComplete = (courseId, totalLessons, completedLessons) => {
    const newProgress = Math.round((completedLessons / totalLessons) * 100);
    updateProgress(courseId, newProgress);
  };

  return {
    progress,
    updateProgress,
    getProgress,
    markLessonComplete
  };
};