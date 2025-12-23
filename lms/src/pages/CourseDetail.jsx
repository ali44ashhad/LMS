// src/pages/CourseDetail.jsx
import React, { useState } from 'react'; 
import CourseDetail from '../componets/courses/CourseDetail';
import CoursePlayer from '../componets/courses/CoursePlayer';
import { enrollmentAPI } from '../services/api';

const CourseDetailPage = ({ course, onBack, onEnrollSuccess }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(true);
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(true);
      await enrollmentAPI.enroll(courseId);
      alert('Successfully enrolled in course!');
      onEnrollSuccess && onEnrollSuccess();
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonComplete = () => {
    // Mark lesson as completed and update progress
    console.log('Lesson completed:', currentLesson);
    // In a real app, you would update the lesson status in your state
  };

  const handleNextLesson = () => {
    // Logic to go to next lesson
    console.log('Next lesson');
  };

  const handlePreviousLesson = () => {
    // Logic to go to previous lesson
    console.log('Previous lesson');
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
    />
  );
};

export default CourseDetailPage;





