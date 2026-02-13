import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.user;
  },

  // Verify branch access
  verifyBranch: async (branchCode) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${API_URL}/verify-branch`,
      { branchCode },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Log file upload
  logUpload: async (branchId, fileName, fileSize) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${API_URL}/log-upload`,
      { branchId, fileName, fileSize },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  }
};

export default authService;