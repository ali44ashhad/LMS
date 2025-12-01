# Learning Management System (LMS)

A complete full-stack Learning Management System with authentication, course management, assignments, quizzes, and an admin panel.

## 🌟 Features

### For Students
- 📚 Browse and enroll in courses
- 📝 Submit assignments
- 🧠 Take quizzes with auto-grading
- 📊 Track learning progress
- 🏆 View grades and performance
- 📅 Calendar view for deadlines

### For Teachers
- ➕ Create and manage courses
- 📋 Create assignments and quizzes
- ✅ Grade student submissions
- 👥 View enrolled students
- 📈 Track student performance

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
- Vite
- Modern ES6+ JavaScript

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
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

# Edit .env file with your MongoDB URI and other settings
# Default MongoDB URI: mongodb://localhost:27017/lms

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

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Default Login Credentials

After running the seed script, you can login with:

**Admin Account:**
- Email: `admin@lms.com`
- Password: `Admin@123`

**Teacher Account:**
- Email: `sarah@lms.com`
- Password: `Teacher@123`

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
│   │   ├── Assignment.model.js
│   │   ├── Quiz.model.js
│   │   ├── Enrollment.model.js
│   │   └── Grade.model.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── assignment.routes.js
│   │   ├── quiz.routes.js
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
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── common/
│   │   │   ├── courses/
│   │   │   ├── assignments/
│   │   │   ├── quizzes/
│   │   │   └── dashboard/
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminUsers.jsx
│   │   ├── services/        # API service layer
│   │   │   └── api.js
│   │   ├── data/           # Mock data
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
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

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Teacher/Admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course (Admin)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my` - Get my enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:id/grade` - Grade assignment

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes/:id/start` - Start quiz
- `POST /api/quizzes/:id/submit` - Submit quiz

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

For complete API documentation, see [backend/README.md](backend/README.md)

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `lms` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Usage

1. **Start MongoDB** (if running locally):
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd lms
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 👥 User Roles & Permissions

### Student
- View and enroll in courses
- Submit assignments
- Take quizzes
- View own grades
- Track progress

### Teacher
- All student permissions
- Create and manage courses
- Create assignments and quizzes
- Grade student submissions
- View student performance

### Admin
- All permissions
- User management (create, update, delete users)
- System analytics
- Complete course management
- Override any restrictions

## 🎨 Features Highlights

### Authentication System
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Protected routes

### Course Management
- Create courses with lessons
- Course categorization
- Progress tracking
- Enrollment system

### Assessment System
- Assignment submission and grading
- Auto-graded quizzes
- Multiple question types (MCQ, True/False, Short Answer)
- Attempt tracking

### Admin Panel
- Real-time statistics
- User management interface
- Course moderation
- System monitoring

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check MongoDB URI in `.env` file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in backend `.env` file
- Kill process using the port: `npx kill-port 5000`

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
2. Use a production MongoDB instance
3. Set secure JWT_SECRET
4. Deploy to platforms like Heroku, Railway, or DigitalOcean

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

## 🙏 Acknowledgments

- React and Vite teams
- MongoDB and Mongoose
- Express.js community
- Tailwind CSS

## 📧 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Happy Learning! 🎓**
