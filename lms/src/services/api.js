const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Authentication APIs
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// Course APIs
export const courseAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/courses?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getEnrolled: async () => {
    const response = await fetch(`${API_URL}/enrollments/my`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (courseData) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  update: async (id, courseData) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Enrollment APIs
export const enrollmentAPI = {
  getMy: async () => {
    const response = await fetch(`${API_URL}/enrollments/my`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  enroll: async (courseId) => {
    const response = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ courseId })
    });
    return handleResponse(response);
  },

  updateProgress: async (enrollmentId, progressData) => {
    const response = await fetch(`${API_URL}/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData)
    });
    return handleResponse(response);
  }
};

// Grade APIs
export const gradeAPI = {
  getMy: async (courseId = null) => {
    const query = courseId ? `?courseId=${courseId}` : '';
    const response = await fetch(`${API_URL}/grades/my${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getByCourse: async (courseId) => {
    const response = await fetch(`${API_URL}/grades/course/${courseId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
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
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/users?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/courses?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  deleteCourse: async (id) => {
    const response = await fetch(`${API_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getEnrollments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/enrollments?${queryString}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default {
  auth: authAPI,
  courses: courseAPI,
  enrollments: enrollmentAPI,
  grades: gradeAPI,
  users: userAPI,
  admin: adminAPI
};
