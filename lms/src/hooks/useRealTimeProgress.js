// src/hooks/useRealTimeProgress.js
import { useState, useEffect, useCallback } from 'react';
import { enrollmentAPI } from '../services/api';

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
      const completedCourses = enrollments.filter((e) => e.progress === 100).length;
      const overallProgress = totalCourses > 0
        ? Math.round(
            enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / totalCourses
          )
        : 0;

      setProgressData({
        overallProgress,
        completedCourses,
        totalCourses,
        enrollments
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

  return {
    ...progressData,
    loading,
    error,
    refresh: fetchProgressData
  };
};
