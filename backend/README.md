# LMS Backend API

Complete backend API for the Learning Management System (LMS).

## Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-based Access Control (Student, Admin)
- 📚 Course Management
- 🎓 Enrollment & Progress Tracking
- ‍💼 Admin Panel APIs

## Tech Stack

- Node.js & Express.js
- PostgreSQL
- JWT for Authentication
- bcryptjs for Password Hashing

## Prerequisites

- Node.js (v16 or higher)
- PostreSQL

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
DB_USER=db_user_name
DB_HOST=db_host
DB_DATABASE=db_name
DB_PASSWORD=db_password
DB_PORT=db_port
# DB Table
DB_SCHEMA=db_schema

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Note:** To get Cloudinary credentials:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your `Cloud Name`, `API Key`, and `API Secret`


5. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:{PORT}`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin/ Teacher)
- `PUT /api/courses/:id` - Update course (Admin/ Teacher)
- `DELETE /api/courses/:id` - Delete course (Admin/ Teacher)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my` - Get my enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

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

1. **Student**: Can enroll in courses and track progress
2. **Admin**: Full access to all resources, user management, and analytics

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── models/
│   ├── User.model.js      # User schema
│   ├── Course.model.js    # Course schema
│   └── Enrollment.model.js # Enrollment schema
├── routes/
│   ├── auth.routes.js     # Authentication routes
│   ├── user.routes.js     # User routes
│   ├── course.routes.js   # Course routes
│   ├── enrollment.routes.js # Enrollment routes
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
| MONGODB_URI | MongoDB connection string | - |
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
