// src/utils/helpers.js
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const calculateGrade = (score, total) => {
  const percentage = (score / total) * 100;
  
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

export const getGradeColor = (grade) => {
  const gradeColors = {
    'A': 'text-green-600 bg-green-100',
    'B': 'text-blue-600 bg-blue-100',
    'C': 'text-yellow-600 bg-yellow-100',
    'D': 'text-orange-600 bg-orange-100',
    'F': 'text-red-600 bg-red-100'
  };
  return gradeColors[grade] || 'text-gray-600 bg-gray-100';
};

export const generateCalendarEvents = (courses, assignments, quizzes) => {
  const events = [];

  courses.forEach(course => {
    events.push({
      id: `course-${course.id}`,
      title: `${course.title} - Class`,
      start: new Date(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
      type: 'course',
      color: 'blue'
    });
  });

  assignments.forEach(assignment => {
    events.push({
      id: `assignment-${assignment.id}`,
      title: `${assignment.title} - Due`,
      start: new Date(assignment.dueDate),
      end: new Date(new Date(assignment.dueDate).getTime() + 60 * 60 * 1000),
      type: 'assignment',
      color: 'red'
    });
  });

  quizzes.forEach(quiz => {
    events.push({
      id: `quiz-${quiz.id}`,
      title: `${quiz.title} - Quiz`,
      start: new Date(quiz.dueDate),
      end: new Date(new Date(quiz.dueDate).getTime() + 60 * 60 * 1000),
      type: 'quiz',
      color: 'green'
    });
  });

  return events;
};