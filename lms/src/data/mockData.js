// src/data/mockData.js
export const courses = [
  {
    id: 1,
    title: 'Web Development Fundamentals',
    instructor: 'Sarah Johnson',
    progress: 75,
    image: '🌐',
    category: 'Development',
    duration: '8 weeks',
    lessons: 12,
    enrolled: true,
    description: 'Learn the fundamentals of modern web development including HTML, CSS, and JavaScript.',
    level: 'Beginner',
    rating: 4.8,
    students: 1245,
    lastAccessed: '2 hours ago'
  },
  {
    id: 2,
    title: 'Data Science Essentials',
    instructor: 'Michael Chen',
    progress: 30,
    image: '📊',
    category: 'Data Science',
    duration: '10 weeks',
    lessons: 15,
    enrolled: true,
    description: 'Master data analysis, visualization, and machine learning basics.',
    level: 'Intermediate',
    rating: 4.6,
    students: 892,
    lastAccessed: '1 day ago'
  },
  {
    id: 3,
    title: 'UI/UX Design Principles',
    instructor: 'Emma Wilson',
    progress: 0,
    image: '🎨',
    category: 'Design',
    duration: '6 weeks',
    lessons: 10,
    enrolled: false,
    description: 'Learn user-centered design principles and create engaging user experiences.',
    level: 'Beginner',
    rating: 4.9,
    students: 1567,
    lastAccessed: null
  },
  {
    id: 4,
    title: 'Digital Marketing Strategy',
    instructor: 'Alex Rodriguez',
    progress: 0,
    image: '📱',
    category: 'Marketing',
    duration: '4 weeks',
    lessons: 8,
    enrolled: false,
    description: 'Develop effective digital marketing strategies for modern businesses.',
    level: 'Intermediate',
    rating: 4.5,
    students: 734,
    lastAccessed: null
  },
  {
    id: 5,
    title: 'Advanced JavaScript Patterns',
    instructor: 'David Kim',
    progress: 45,
    image: '⚡',
    category: 'Development',
    duration: '6 weeks',
    lessons: 14,
    enrolled: true,
    description: 'Master advanced JavaScript concepts and design patterns.',
    level: 'Advanced',
    rating: 4.7,
    students: 543,
    lastAccessed: '5 hours ago'
  },
  {
    id: 6,
    title: 'Mobile App Development',
    instructor: 'Lisa Wang',
    progress: 0,
    image: '📱',
    category: 'Development',
    duration: '12 weeks',
    lessons: 18,
    enrolled: false,
    description: 'Build cross-platform mobile applications using React Native.',
    level: 'Intermediate',
    rating: 4.8,
    students: 987,
    lastAccessed: null
  }
];

export const announcements = [
  {
    id: 1,
    title: 'New Course Available',
    content: 'Advanced JavaScript Patterns course is now available for enrollment.',
    date: '2 hours ago',
    author: 'Admin'
  },
  {
    id: 2,
    title: 'System Maintenance',
    content: 'The LMS will be undergoing maintenance this Saturday from 2-4 AM.',
    date: '1 day ago',
    author: 'Admin'
  },
  {
    id: 3,
    title: 'Webinar Invitation',
    content: 'Join our live webinar on React Hooks this Friday at 5 PM.',
    date: '3 days ago',
    author: 'Instructor Team'
  }
];

export const stats = [
  {
    id: 1,
    title: 'Courses in Progress',
    value: '5',
    change: '+2',
    changeType: 'positive',
    icon: '📚'
  },
  {
    id: 2,
    title: 'Completed Courses',
    value: '8',
    change: '+3',
    changeType: 'positive',
    icon: '✅'
  },
  {
    id: 3,
    title: 'Average Score',
    value: '87%',
    change: '+5%',
    changeType: 'positive',
    icon: '🏆'
  },
  {
    id: 4,
    title: 'Study Hours',
    value: '42h',
    change: '+12h',
    changeType: 'positive',
    icon: '⏱️'
  }
];

export const assignments = [
  {
    id: 1,
    title: 'Responsive Layout Project',
    course: 'Web Development Fundamentals',
    dueDate: '2025-01-15',
    status: 'submitted',
    grade: 'A-'
  },
  {
    id: 2,
    title: 'Data Analysis Report',
    course: 'Data Science Essentials',
    dueDate: '2025-01-20',
    status: 'pending',
    grade: null
  },
  {
    id: 3,
    title: 'User Research Presentation',
    course: 'UI/UX Design Principles',
    dueDate: '2025-01-25',
    status: 'not-started',
    grade: null
  }
];

export const quizzes = [
  {
    id: 1,
    title: 'HTML & CSS Basics',
    course: 'Web Development Fundamentals',
    dueDate: '2025-01-18',
    duration: '30 mins',
    questions: 20,
    status: 'completed',
    score: 85
  },
  {
    id: 2,
    title: 'JavaScript Fundamentals',
    course: 'Web Development Fundamentals',
    dueDate: '2025-01-25',
    duration: '45 mins',
    questions: 25,
    status: 'upcoming',
    score: null
  },
  {
    id: 3,
    title: 'Python for Data Science',
    course: 'Data Science Essentials',
    dueDate: '2025-01-22',
    duration: '60 mins',
    questions: 30,
    status: 'upcoming',
    score: null
  }
];