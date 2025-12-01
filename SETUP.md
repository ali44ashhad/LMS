# Quick Setup Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (v16+)
- ✅ MongoDB installed

## Step-by-Step Setup

### Step 1: Start MongoDB

**Option A: Using MongoDB as a Windows Service**
```powershell
net start MongoDB
```

**Option B: Using MongoDB Compass**
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`

**Option C: Using MongoDB Atlas (Cloud)**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms
   ```

### Step 2: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 3: Seed the Database

```powershell
npm run seed
```

You should see:
```
✅ Database seeded successfully!

Login Credentials:
===================
Admin:
  Email: admin@lms.com
  Password: Admin@123

Teacher:
  Email: sarah@lms.com
  Password: Teacher@123

Student:
  Email: john@lms.com
  Password: Student@123
===================
```

### Step 4: Start Backend Server

```powershell
npm run dev
```

Backend will run on: http://localhost:5000

### Step 5: Install Frontend Dependencies

Open a new terminal:

```powershell
cd lms
npm install
```

### Step 6: Start Frontend

```powershell
npm run dev
```

Frontend will run on: http://localhost:5173

### Step 7: Access the Application

Open your browser and go to: http://localhost:5173

Login with any of the demo credentials provided after seeding.

## Troubleshooting

### MongoDB Not Starting

**Check if MongoDB is installed:**
```powershell
mongod --version
```

**If not installed, download from:**
https://www.mongodb.com/try/download/community

**After installation, start MongoDB:**
```powershell
# As Windows Service
net start MongoDB

# Or manually
mongod --dbpath "C:\data\db"
```

### Port Already in Use

**Kill process on port 5000:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

**Or change the port in backend/.env:**
```
PORT=5001
```

### Cannot Connect to Backend

Make sure:
1. Backend server is running (check terminal)
2. MongoDB is running
3. `.env` file exists in backend folder
4. `VITE_API_URL` in frontend `.env` matches backend URL

### CORS Errors

The backend is configured to accept all origins in development. If you still face issues, check:
1. Backend server is running
2. Frontend `.env` has correct API URL
3. No proxy/firewall blocking requests

## Testing the Application

### 1. Login as Student
- Email: john@lms.com
- Password: Student@123
- Test: Enroll in courses, submit assignments, take quizzes

### 2. Login as Teacher
- Email: sarah@lms.com
- Password: Teacher@123
- Test: Create courses, assignments, and quizzes

### 3. Login as Admin
- Email: admin@lms.com
- Password: Admin@123
- Test: User management, system stats, course moderation

## Success Checklist

- [ ] MongoDB is running
- [ ] Backend dependencies installed
- [ ] Database seeded successfully
- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] Can login with demo credentials
- [ ] Can navigate between pages
- [ ] API calls working (check browser console)

## Need Help?

If you encounter any issues:
1. Check both terminal windows for error messages
2. Verify all environment variables are set
3. Make sure all dependencies are installed
4. Restart both servers
5. Clear browser cache and cookies

## Quick Commands Reference

```powershell
# Start MongoDB
net start MongoDB

# Backend
cd backend
npm install
npm run seed
npm run dev

# Frontend (new terminal)
cd lms
npm install
npm run dev
```

Happy coding! 🚀
