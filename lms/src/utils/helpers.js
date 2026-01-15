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