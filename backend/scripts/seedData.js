import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Course from '../models/Course.model.js';
import Assignment from '../models/Assignment.model.js';
import Quiz from '../models/Quiz.model.js';
import Enrollment from '../models/Enrollment.model.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Quiz.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@lms.com',
      password: 'Admin@123',
      role: 'admin'
    });

    // Create additional Admin users (for course creation)
    const additionalAdmins = await User.create([
      {
        name: 'Sarah Johnson',
        email: 'sarah@lms.com',
        password: 'Admin@123',
        role: 'admin'
      },
      {
        name: 'Michael Chen',
        email: 'michael@lms.com',
        password: 'Admin@123',
        role: 'admin'
      },
      {
        name: 'Emma Wilson',
        email: 'emma@lms.com',
        password: 'Admin@123',
        role: 'admin'
      }
    ]);

    // Create Students
    const students = await User.create([
      {
        name: 'John Doe',
        email: 'john@lms.com',
        password: 'Student@123',
        role: 'student'
      },
      {
        name: 'Jane Smith',
        email: 'jane@lms.com',
        password: 'Student@123',
        role: 'student'
      }
    ]);

    console.log('Created users');

    // Create Courses
    const courses = await Course.create([
      {
        title: 'Web Development Fundamentals',
        description: 'Learn the fundamentals of modern web development including HTML, CSS, and JavaScript.',
        instructor: additionalAdmins[0]._id,
        instructorName: additionalAdmins[0].name,
        category: 'Development',
        level: 'Beginner',
        duration: '8 weeks',
        image: '🌐',
        rating: 4.8,
        totalRatings: 245,
        enrolledStudents: 1245,
        isPublished: true,
        lessons: [
          {
            title: 'Introduction to HTML',
            description: 'Learn HTML basics',
            duration: '45 mins',
            order: 1
          },
          {
            title: 'CSS Fundamentals',
            description: 'Master CSS styling',
            duration: '60 mins',
            order: 2
          },
          {
            title: 'JavaScript Basics',
            description: 'Introduction to JavaScript',
            duration: '90 mins',
            order: 3
          }
        ]
      },
      {
        title: 'Data Science Essentials',
        description: 'Master data analysis, visualization, and machine learning basics.',
        instructor: additionalAdmins[1]._id,
        instructorName: additionalAdmins[1].name,
        category: 'Data Science',
        level: 'Intermediate',
        duration: '10 weeks',
        image: '📊',
        rating: 4.6,
        totalRatings: 189,
        enrolledStudents: 892,
        isPublished: true,
        lessons: [
          {
            title: 'Python for Data Science',
            description: 'Python basics for data analysis',
            duration: '120 mins',
            order: 1
          },
          {
            title: 'Data Visualization',
            description: 'Create stunning visualizations',
            duration: '90 mins',
            order: 2
          }
        ]
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Learn user-centered design principles and create engaging user experiences.',
        instructor: additionalAdmins[2]._id,
        instructorName: additionalAdmins[2].name,
        category: 'Design',
        level: 'Beginner',
        duration: '6 weeks',
        image: '🎨',
        rating: 4.9,
        totalRatings: 312,
        enrolledStudents: 1567,
        isPublished: true,
        lessons: [
          {
            title: 'Design Thinking',
            description: 'Introduction to design thinking',
            duration: '60 mins',
            order: 1
          }
        ]
      }
    ]);

    console.log('Created courses');

    // Create Enrollments
    await Enrollment.create([
      {
        student: students[0]._id,
        course: courses[0]._id,
        progress: 75,
        completedLessons: [courses[0].lessons[0]._id, courses[0].lessons[1]._id]
      },
      {
        student: students[0]._id,
        course: courses[1]._id,
        progress: 30,
        completedLessons: [courses[1].lessons[0]._id]
      },
      {
        student: students[1]._id,
        course: courses[0]._id,
        progress: 50
      }
    ]);

    console.log('Created enrollments');

    // Create Assignments
    const assignments = await Assignment.create([
      {
        title: 'Responsive Layout Project',
        description: 'Create a responsive website layout using HTML and CSS',
        course: courses[0]._id,
        instructor: teachers[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        points: 100,
        instructions: 'Build a fully responsive website with mobile, tablet, and desktop views'
      },
      {
        title: 'Data Analysis Report',
        description: 'Analyze the provided dataset and create visualizations',
        course: courses[1]._id,
        instructor: teachers[1]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        points: 100,
        instructions: 'Use Python and Pandas to analyze the dataset'
      }
    ]);

    console.log('Created assignments');

    // Create Quizzes
    await Quiz.create([
      {
        title: 'HTML & CSS Basics',
        description: 'Test your knowledge of HTML and CSS fundamentals',
        course: courses[0]._id,
        instructor: teachers[0]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 30,
        totalPoints: 100,
        questions: [
          {
            question: 'What does HTML stand for?',
            type: 'multiple-choice',
            options: [
              { text: 'Hyper Text Markup Language', isCorrect: true },
              { text: 'High Tech Modern Language', isCorrect: false },
              { text: 'Home Tool Markup Language', isCorrect: false },
              { text: 'Hyperlinks and Text Markup Language', isCorrect: false }
            ],
            points: 10
          },
          {
            question: 'CSS stands for Cascading Style Sheets',
            type: 'true-false',
            options: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ],
            correctAnswer: 'True',
            points: 10
          }
        ]
      },
      {
        title: 'Python for Data Science',
        description: 'Test your Python programming skills',
        course: courses[1]._id,
        instructor: teachers[1]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        duration: 45,
        totalPoints: 100,
        questions: [
          {
            question: 'Which library is commonly used for data manipulation in Python?',
            type: 'multiple-choice',
            options: [
              { text: 'Pandas', isCorrect: true },
              { text: 'Flask', isCorrect: false },
              { text: 'Django', isCorrect: false },
              { text: 'Requests', isCorrect: false }
            ],
            points: 10
          }
        ]
      }
    ]);

    console.log('Created quizzes');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('===================');
    console.log('Admin:');
    console.log('  Email: admin@lms.com');
    console.log('  Password: Admin@123');
    console.log('\nAdditional Admin (for course creation):');
    console.log('  Email: sarah@lms.com');
    console.log('  Password: Admin@123');
    console.log('\nStudent:');
    console.log('  Email: john@lms.com');
    console.log('  Password: Student@123');
    console.log('===================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
