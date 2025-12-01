// src/data/constants.js
export const COURSE_CATEGORIES = [
  'All',
  'Development',
  'Data Science',
  'Design',
  'Marketing',
  'Business',
  'Photography',
  'Music'
];

export const COURSE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
};

export const ASSIGNMENT_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded'
};

export const QUIZ_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

export const GRADE_SCALE = {
  'A': { min: 90, color: 'text-green-600', bgColor: 'bg-green-100' },
  'B': { min: 80, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'C': { min: 70, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  'D': { min: 60, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  'F': { min: 0, color: 'text-red-600', bgColor: 'bg-red-100' }
};