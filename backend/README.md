# LMS Backend API

Complete backend API for the Learning Management System (LMS).

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-based Access Control (Student, Teacher, Admin)
- 📚 Course Management
- 📝 Assignment System
- 📊 Quiz System with Auto-grading
- 🎓 Enrollment & Progress Tracking
- 📈 Grades Management
- 👨‍💼 Admin Panel APIs

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT for Authentication
- bcryptjs for Password Hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

6. Seed the database with sample data:
```bash
npm run seed
```

7. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## Default Login Credentials

After running the seed script:

**Admin:**
- Email: admin@lms.com
- Password: Admin@123

**Teacher:**
- Email: sarah@lms.com
- Password: Teacher@123

**Student:**
- Email: john@lms.com
- Password: Student@123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Teacher/Admin)
- `PUT /api/courses/:id` - Update course (Teacher/Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `GET /api/courses/my/enrolled` - Get enrolled courses

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my` - Get my enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (Teacher/Admin)
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:assignmentId/submissions/:submissionId/grade` - Grade submission (Teacher/Admin)

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get single quiz
- `POST /api/quizzes` - Create quiz (Teacher/Admin)
- `POST /api/quizzes/:id/start` - Start quiz attempt
- `POST /api/quizzes/:id/submit` - Submit quiz attempt

### Grades
- `GET /api/grades/my` - Get my grades
- `GET /api/grades/course/:courseId` - Get course grades (Teacher/Admin)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users with filters
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/courses` - Get all courses (including unpublished)
- `DELETE /api/admin/courses/:id` - Delete course with related data
- `GET /api/admin/enrollments` - Get all enrollments

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

## User Roles

1. **Student**: Can enroll in courses, submit assignments, take quizzes
2. **Teacher**: Can create/manage courses, assignments, and quizzes; grade submissions
3. **Admin**: Full access to all resources, user management, and analytics

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── models/
│   ├── User.model.js      # User schema
│   ├── Course.model.js    # Course schema
│   ├── Enrollment.model.js # Enrollment schema
│   ├── Assignment.model.js # Assignment schema
│   ├── Quiz.model.js      # Quiz schema
│   └── Grade.model.js     # Grade schema
├── routes/
│   ├── auth.routes.js     # Authentication routes
│   ├── user.routes.js     # User routes
│   ├── course.routes.js   # Course routes
│   ├── enrollment.routes.js # Enrollment routes
│   ├── assignment.routes.js # Assignment routes
│   ├── quiz.routes.js     # Quiz routes
│   ├── grade.routes.js    # Grade routes
│   └── admin.routes.js    # Admin routes
├── middleware/
│   └── auth.middleware.js # Authentication & authorization middleware
├── scripts/
│   └── seedData.js        # Database seeding script
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── server.js              # Entry point
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/lms |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment mode | development |

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
