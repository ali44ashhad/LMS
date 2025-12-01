# Learning Management System (LMS)

A modern full-stack Learning Management System with sci-fi themed UI, authentication, course management, and admin panel.

## 🌟 Features

### For Students
- 📚 Browse and enroll in courses
- 📊 Track learning progress
- 🎯 View course modules and lessons
- 📅 Monitor course completion
- 👤 Profile management

### For Admins
- 👨‍💼 Complete admin dashboard
- 👥 User management (CRUD operations)
- 📚 Course management
- 📊 System statistics and analytics
- 🎓 Enrollment tracking

## 🛠️ Tech Stack

### Frontend
- React 19.2
- Tailwind CSS 4.1
- Vite 7.2
- Custom SAIBA-45 font (sci-fi theme)
- Modern ES6+ JavaScript

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
cd lms
```

### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your MongoDB Atlas URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
# Open a new terminal and navigate to frontend folder
cd lms

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5174`

## 🔐 Default Login Credentials

After running the seed script, you can login with:

**Admin Account:**
- Email: `admin@lms.com`
- Password: `Admin@123`

**Student Account:**
- Email: `john@lms.com`
- Password: `Student@123`

## 📁 Project Structure

```
lms/
├── backend/                    # Backend API
│   ├── config/                # Configuration files
│   │   └── db.js             # Database connection
│   ├── models/               # Mongoose models
│   │   ├── User.model.js
│   │   ├── Course.model.js
│   │   ├── Enrollment.model.js
│   │   └── Grade.model.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── enrollment.routes.js
│   │   ├── grade.routes.js
│   │   └── admin.routes.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.middleware.js
│   ├── scripts/             # Utility scripts
│   │   └── seedData.js
│   ├── .env                 # Environment variables
│   ├── server.js           # Entry point
│   └── package.json
│
├── lms/                       # Frontend React App
│   ├── public/
│   │   └── fonts/           # SAIBA-45 custom font
│   ├── src/
│   │   ├── componets/       # React components
│   │   │   ├── common/      # Header, Sidebar, Footer
│   │   │   ├── courses/     # Course related components
│   │   │   └── dashboard/   # Dashboard components
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── AdminCourses.jsx
│   │   ├── services/        # API service layer
│   │   │   └── api.js
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── index.css       # Global styles with sci-fi theme
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my` - Get my enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### Grades
- `GET /api/grades/my` - Get my grades
- `GET /api/grades/course/:courseId` - Get course grades

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/courses` - Get all courses
- `DELETE /api/admin/courses/:id` - Delete course

For complete API documentation, see [backend/README.md](backend/README.md)

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `lms` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Usage

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd lms
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: `http://localhost:5174`
   - Backend API: `http://localhost:5000`

## 👥 User Roles & Permissions

### Student
- View and enroll in courses
- Track course progress
- View grades
- Update profile

### Admin
- All student permissions
- User management (create, update, delete users)
- Course management (create, update, delete courses)
- System analytics
- Enrollment management

## 🎨 Features Highlights

### Sci-Fi Themed UI
- Custom SAIBA-45 font for headings and buttons
- Dark mode design with neon accents
- Futuristic button styles and hover effects
- Clean, modern interface

### Authentication System
- JWT-based authentication
- Role-based access control (Student/Admin)
- Secure password hashing with bcrypt
- Protected routes

### Course Management
- Create courses with modules and resources
- Course categorization
- Progress tracking
- Enrollment system

### Admin Panel
- Real-time statistics
- User management interface
- Course moderation
- System monitoring

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB Atlas connection string is correct
- Check network access settings in MongoDB Atlas
- Verify username and password in connection string

### Port Already in Use
- Frontend default port: 5174
- Backend default port: 5000
- Change PORT in backend `.env` if needed

### CORS Issues
- Backend is configured to accept requests from any origin
- Update CORS settings in `server.js` if needed

## 📝 Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd lms
npm run dev  # Starts Vite dev server
```

### Seeding Database
```bash
cd backend
npm run seed
```

## 🚀 Production Deployment

### Backend
1. Set NODE_ENV to 'production'
2. Use MongoDB Atlas for production database
3. Set secure JWT_SECRET
4. Deploy to platforms like Railway, Render, or DigitalOcean

### Frontend
```bash
cd lms
npm run build
# Deploy the 'dist' folder to Vercel, Netlify, or any static host
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Happy Learning! 🎓**
