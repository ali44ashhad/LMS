// src/pages/CourseDetail.jsx
import React, { useState } from 'react'; 
import CourseDetail from '../componets/courses/CourseDetail';
import CoursePlayer from '../componets/courses/CoursePlayer';

const CourseDetailPage = ({ course, onBack }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(true);
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
    />
  );
};

export default CourseDetailPage;