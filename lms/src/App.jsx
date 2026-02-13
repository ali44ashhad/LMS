// src/App.jsx
// Auth: No login/signup in LMS. User is verified by token from Nesta backend.
// If token is valid → profile and full app. If no/invalid token → public pages only.
import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile'; 
import AdminCourses from './pages/AdminCourses';
import AdminCourseCreate from './pages/AdminCourseCreate';
import Header from './componets/common/Header';
import Sidebar from './componets/common/Sidebar';
import Footer from './componets/common/Footer';
import Courses from './pages/Cources';
import CourseDetailPage from './pages/CourseDetail';
import { authAPI } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // SSO: token can come from cookie OR URL (?token=... or #token=...)
        const url = new URL(window.location.href);
        const tokenFromQuery = url.searchParams.get('token');
        const tokenFromHash = (() => {
          const hash = (url.hash || '').replace(/^#/, '');
          if (!hash) return null;
          const p = new URLSearchParams(hash);
          return p.get('token');
        })();
        const ssoToken = tokenFromQuery || tokenFromHash || undefined;

        const currentUser = await authAPI.validateToken(ssoToken);
        // DEBUG: remove after fixing SSO – paste this output if login still fails
        console.log('[LMS auth] validateToken response:', currentUser);

        // Normalize different backend response shapes (LMS /auth/validate vs Nesta /auth/check)
        const raw = currentUser || {};
        const userPayload =
          raw.user || // { success, user: {...} }
          (raw.data && (raw.data.user || raw.data)) || // { data: { user } } or { data: {...} }
          (raw.success && !raw.user && !raw.data ? raw : null); // plain { success:true, ...userFields }

        if (userPayload) {
          const roles = Array.isArray(userPayload.roles) ? userPayload.roles : [];
          const name = userPayload.name ?? userPayload.username ?? userPayload.displayName ?? userPayload.fullName ?? '';
          const userData = {
            ...userPayload,
            name: name || userPayload.name,
            roles,
            _id: userPayload._id ?? userPayload.id,
            id: userPayload.id ?? userPayload._id,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);

          // Enrich with profile from DB so header shows correct name/avatar from first load (no backend change)
          try {
            const profileRes = await authAPI.getCurrentUser();
            const dbUser = profileRes?.user || profileRes;
            if (dbUser && (dbUser.name || dbUser.email || dbUser.avatar)) {
              const merged = {
                ...userData,
                name: dbUser.name ?? userData.name,
                email: dbUser.email ?? userData.email,
                avatar: dbUser.avatar ?? userData.avatar,
                bio: dbUser.bio ?? userData.bio,
              };
              localStorage.setItem('user', JSON.stringify(merged));
              setUser(merged);
            }
          } catch (_) {
            // keep validateToken user if profile fetch fails
          }

          // Clean token from URL after successful validation (avoid leaking via copy/paste/history)
          if (tokenFromQuery) url.searchParams.delete('token');
          if (tokenFromHash) {
            const hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));
            hashParams.delete('token');
            url.hash = hashParams.toString() ? `#${hashParams.toString()}` : '';
          }
          if (tokenFromQuery || tokenFromHash) {
            window.history.replaceState({}, document.title, url.toString());
          }

          const rolesArr = Array.isArray(userData.roles) ? userData.roles : [];
          const isAdmin = rolesArr.includes('admin');

          if (isAdmin) setActiveTab('admin-dashboard');
          else setActiveTab('dashboard');
        } else {
          authAPI.logout();
          setUser(null);
        }
      } catch (_) {
        authAPI.logout();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setActiveTab('courses');
  };

  const renderContent = () => {
    const rolesArr = Array.isArray(user?.roles) ? user.roles : [];
    const isAdmin = rolesArr.includes('admin');

    if (isAdmin) {
      const adminCourseHandlers = {
        onCreateNew: () => {
          setEditingCourse(null);
          setActiveTab('admin-course-create');
        },
        onEdit: (course) => {
          setEditingCourse(course);
          setActiveTab('admin-course-create');
        }
      };
      switch (activeTab) {
        case 'admin-dashboard':
        case 'admin-courses':
          return <AdminCourses {...adminCourseHandlers} />;
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
          return <AdminCourses {...adminCourseHandlers} />;
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

  const isPublic = !user;
  const sidebarRoles = Array.isArray(user?.roles) ? user.roles : [];
  const sidebarRole = sidebarRoles.includes('admin')
    ? 'admin'
    : (user?.role || 'student');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user} onLogout={handleLogout} isPublic={isPublic} />

      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={sidebarRole}
          isPublic={isPublic}
        />

        <main
          className="
            flex-1 p-3 md:p-6 overflow-x-hidden
            bg-[linear-gradient(#2FC1E822_2px,transparent_2px),
                linear-gradient(90deg,#2FC1E822_2px,transparent_2px)]
            bg-[size:40px_40px]
          "
        >
          {isPublic ? (
            activeTab === 'course-detail' ? (
              <CourseDetailPage
                course={selectedCourse}
                onBack={() => setActiveTab('courses')}
                isPublic
              />
            ) : (
              <Courses
                onCourseSelect={(course) => {
                  setSelectedCourse(course);
                  setActiveTab('course-detail');
                }}
                isPublic
              />
            )
          ) : (
            renderContent()
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
