// src/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCourses from './pages/AdminCourses';
import AdminCourseCreate from './pages/AdminCourseCreate';
import Header from './componets/common/Header';
import Sidebar from './componets/common/Sidebar';
import Footer from './componets/common/Footer';
import Courses from './pages/Cources';
import CourseDetailPage from './pages/CourseDetail';
import { authAPI } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // Both token and user must exist
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token is still valid by calling /auth/me
          try {
            const currentUser = await authAPI.getCurrentUser();
            if (currentUser.success && currentUser.user) {
              // Update user data from server
              const userData = {
                ...currentUser.user,
                _id: currentUser.user._id || currentUser.user.id
              };
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
              if (userData.role === 'admin') {
                setActiveTab('admin-dashboard');
              }
            } else {
              // Token invalid, clear storage
              authAPI.logout();
              setUser(null);
            }
          } catch (error) {
            // Token invalid or expired, clear storage
            authAPI.logout();
            setUser(null);
          }
        } catch (err) {
          // Invalid user data, clear storage
          authAPI.logout();
          setUser(null);
        }
      } else {
        // Missing token or user, clear storage
        if (token || storedUser) {
          authAPI.logout();
        }
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogin = (userData) => {
    // Ensure user data is properly formatted
    const formattedUser = {
      ...userData,
      _id: userData._id || userData.id
    };
    
    // Ensure token and user are in localStorage (should already be set by Login component)
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      setActiveTab(formattedUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    } else {
      // Token missing, clear and show error
      authAPI.logout();
      setUser(null);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'admin-dashboard':
          return <AdminDashboard />;
        case 'admin-users':
          return <AdminUsers />;
        case 'admin-courses':
          return (
            <AdminCourses
              onCreateNew={() => {
                setEditingCourse(null);
                setActiveTab('admin-course-create');
              }}
              onEdit={(course) => {
                setEditingCourse(course);
                setActiveTab('admin-course-create');
              }}
            />
          );
        case 'admin-course-create':
          return (
            <AdminCourseCreate
              course={editingCourse}
              onBack={() => {
                setEditingCourse(null);
                setActiveTab('admin-courses');
              }}
              onSuccess={() => {
                setEditingCourse(null);
                setActiveTab('admin-courses');
              }}
            />
          );
        default:
          return <AdminDashboard />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onCourseSelect={(course) => {
              setSelectedCourse(course);
              setActiveTab('course-detail');
            }}
          />
        );
      case 'courses':
        return (
          <Courses
            onCourseSelect={(course) => {
              setSelectedCourse(course);
              setActiveTab('course-detail');
            }}
          />
        );
      case 'course-detail':
        return (
          <CourseDetailPage
            course={selectedCourse}
            onBack={() => setActiveTab('courses')}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user}
            onLogout={handleLogout}
            onUserUpdate={setUser}
            onCourseSelect={(course) => {
              setSelectedCourse(course);
              setActiveTab('course-detail');
            }}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user.role}
        />

        {/* ✅ Background pattern ONLY on main content */}
        <main
          className="
            flex-1 p-3 md:p-6 overflow-x-hidden
            bg-[linear-gradient(#2FC1E822_2px,transparent_2px),
                linear-gradient(90deg,#2FC1E822_2px,transparent_2px)]
            bg-[size:40px_40px]
          "
        >
          {renderContent()}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
