const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const NESTA_API_URL = import.meta.env.VITE_NESTA_API_URL || 'http://localhost:3000/api';
// Optional SSO API base (Nesta auth cookie may be issued by a different API origin)
const SSO_API_URL = import.meta.env.VITE_SSO_API_URL || '';

// Always include cookies for LMS API (token is in cookie for Nesta SSO)
const fetchWithCreds = (url, options = {}) => {
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {})
    }
  });
};

// Helper function to set auth headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if response has content and is JSON
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Failed to parse JSON response');
    }
  } else {
    // Handle non-JSON responses (e.g., HTML error pages)
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }
  
  return data;
};

// Authentication APIs
export const authAPI = {
  logout: () => {
    // Also clear LMS cookie (if present)
    // Fire-and-forget; still clear local state
    try {
      fetchWithCreds(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (_) {}
    localStorage.removeItem('user');
  },

  // Token validation (SSO handshake). Uses cookie or Authorization header.
  validateToken: async (token) => {
    const buildValidateUrl = (base) => {
      const baseClean = base.replace(/\/$/, '');
      // If we're validating against Nesta SSO API (commonly :3000), the endpoint is often /auth/check.
      const isNestaLocal = baseClean === NESTA_API_URL;
      const path = isNestaLocal ? '/auth/check' : '/auth/validate';

      const url = new URL(`${baseClean}${path}`);
      if (token) url.searchParams.set('token', token);
      return url.toString();
    };

    const tryValidate = async (base) => {
      const response = await fetchWithCreds(buildValidateUrl(base), {
        // Important: do NOT set Content-Type on GET, otherwise browsers send a preflight OPTIONS
        // which may fail on 3rd-party dev servers.
        headers: {}
      });
      return handleResponse(response);
    };

    // 1) Try primary LMS API (default)
    try {
      return await tryValidate(API_URL);
    } catch (err) {
      // 2) If SSO API is configured, try it next
      if (SSO_API_URL) {
        try {
          return await tryValidate(SSO_API_URL);
        } catch (_) {
          // fall through to localhost fallback
        }
      }

      // 3) Dev fallback: many Nesta setups run auth API on :3000
      // Only retry when running on localhost to avoid unexpected prod behavior.
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        try {
          return await tryValidate(NESTA_API_URL);
        } catch (_) {
          // keep original error
        }
      }

      throw err;
    }
  },

  getCurrentUser: async () => {
    // The LMS exposes the current user profile at /users/profile
    const response = await fetchWithCreds(`${API_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    // Profile updates are handled by the LMS at /users/profile.
    // The backend only expects LMS-specific fields (bio, phone, address, avatar).
    const { bio, phone, address, avatar } = userData;

    // DB columns are varchar-limited; clamp text fields.
    const clamp = (val, max) =>
      (val ?? '')
        .toString()
        .slice(0, max);

    const response = await fetchWithCreds(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        bio: clamp(bio, 500),
        phone: clamp(phone, 50),
        address: clamp(address, 500),
        // Avatar can be a full base64 data URL; backend will upload to Cloudinary
        avatar: avatar || ''
      })
    });
    const data = await handleResponse(response);

    // Backend returns { success, profile }. Merge profile back into
    // the existing user object so the rest of the app keeps working.
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
    const profile = data.profile || {};

    const updatedUser = {
      ...existingUser,
      bio: profile.bio ?? existingUser.bio ?? '',
      phone: profile.phone ?? existingUser.phone ?? '',
      address: profile.address ?? existingUser.address ?? '',
      avatar: profile.avatar ?? existingUser.avatar ?? ''
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));

    return {
      success: true,
      user: updatedUser
    };
  }
};

// Course APIs
export const courseAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithCreds(`${API_URL}/courses?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/courses/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getEnrolled: async () => {
    // Backend + docs: GET /api/enrollments/my-enrollments (studentToken)
    const response = await fetchWithCreds(`${API_URL}/enrollments/my-enrollments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (courseData) => {
    const response = await fetchWithCreds(`${API_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  update: async (id, courseData) => {
    const response = await fetchWithCreds(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Normalize enrollment from backend (flat row with course_id, course_title, etc.) to shape frontend expects (nested course, camelCase)
const normalizeEnrollment = (row) => {
  if (!row) return row;
  const courseId = row.course_id ?? row.course?.id ?? row.course?._id;
  return {
    ...row,
    _id: row._id ?? row.id,
    id: row.id ?? row._id,
    course: row.course ?? {
      id: courseId,
      _id: courseId,
      title: row.course_title,
      instructor_name: row.instructor_name,
      thumbnail: row.thumbnail,
      category: row.category,
      level: row.level
    },
    completedLessons: row.completedLessons ?? row.completed_lessons ?? [],
    lastAccessed: row.lastAccessed ?? row.last_accessed
  };
};

// Enrollment APIs
export const enrollmentAPI = {
  getMy: async () => {
    const response = await fetchWithCreds(`${API_URL}/enrollments/my-enrollments`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    const enrollments = (data.enrollments ?? []).map(normalizeEnrollment);
    return { ...data, enrollments };
  },

  enroll: async (courseId) => {
    const response = await fetchWithCreds(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ courseId })
    });
    return handleResponse(response);
  },

  // Backend: PATCH /enrollments/:id/progress with body { lessonId }
  updateProgress: async (enrollmentId, payload) => {
    const lessonId = payload?.lessonId ?? payload?.completedLessons?.[0];
    if (lessonId == null) {
      throw new Error('updateProgress requires lessonId in payload');
    }
    const response = await fetchWithCreds(`${API_URL}/enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lessonId })
    });
    return handleResponse(response);
  }
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await fetchWithCreds(`${API_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await fetchWithCreds(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// Admin APIs
export const adminAPI = {
  getStats: async () => {
    const response = await fetchWithCreds(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getInstructors: async () => {
    const response = await fetchWithCreds(`${API_URL}/admin/instructors`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateCoursePublishStatus: async (courseId, isPublished) => {
    const response = await fetchWithCreds(`${API_URL}/admin/courses/${courseId}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isPublished })
    });
    return handleResponse(response);
  },

  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithCreds(`${API_URL}/admin/users?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateUser: async (id, userData) => {
    const response = await fetchWithCreds(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  deleteUser: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithCreds(`${API_URL}/admin/courses?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get full course details (with modules and lessons) for edit – GET /api/admin/courses/:id
  getCourseById: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/admin/courses/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create course with instructor assignment (admin)
  createCourse: async (courseData) => {
    const response = await fetchWithCreds(`${API_URL}/admin/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  updateCourse: async (id, courseData) => {
    const response = await fetchWithCreds(`${API_URL}/admin/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  deleteCourse: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getEnrollments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithCreds(`${API_URL}/admin/enrollments?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithCreds(`${API_URL}/admin/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(response);
  },

  // Admin module/lesson management (for course create/edit flow)
  createModule: async (data) => {
    const response = await fetchWithCreds(`${API_URL}/admin/modules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        courseId: data.courseId,
        title: data.title,
        description: data.description ?? '',
        order: data.order
      })
    });
    return handleResponse(response);
  },

  updateModule: async (id, data) => {
    const response = await fetchWithCreds(`${API_URL}/admin/modules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteModule: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/admin/modules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  reorderModules: async (courseId, modules) => {
    const response = await fetchWithCreds(`${API_URL}/admin/modules/reorder/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ modules })
    });
    return handleResponse(response);
  },

  createLesson: async (data) => {
    const response = await fetchWithCreds(`${API_URL}/admin/lessons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        moduleId: data.moduleId,
        title: data.title,
        description: data.description ?? '',
        videoUrl: data.videoUrl ?? '',
        duration: data.duration ?? '',
        order: data.order,
        resources: data.resources ?? []
      })
    });
    return handleResponse(response);
  },

  updateLesson: async (id, data) => {
    const response = await fetchWithCreds(`${API_URL}/admin/lessons/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        duration: data.duration,
        resources: data.resources
      })
    });
    return handleResponse(response);
  },

  deleteLesson: async (id) => {
    const response = await fetchWithCreds(`${API_URL}/admin/lessons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  reorderLessons: async (moduleId, lessons) => {
    const response = await fetchWithCreds(`${API_URL}/admin/lessons/reorder/${moduleId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lessons })
    });
    return handleResponse(response);
  }
};

export default {
  auth: authAPI,
  courses: courseAPI,
  enrollments: enrollmentAPI,
  users: userAPI,
  admin: adminAPI
};
