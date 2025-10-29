import axios from 'axios';

// Environment-based configuration
const isDevelopment = import.meta.env.MODE === 'development';
const BASE_URL = isDevelopment 
  ? '/api/Admin' // Use proxy in development
  : 'https://treegar-accounts-api.treegar.com/api/Admin'; // Direct API in production

// API Key - directly declared here
const API_KEY = 'treegaristhePnce@@!!!9801';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Request interceptor - for adding auth tokens and debugging
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure API key is always present
    if (!config.headers['x-api-key']) {
      config.headers['x-api-key'] = API_KEY;
    }
    
    // Enhanced debugging
    console.group('🚀 API Request');
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');
    console.log('Method:', config.method?.toUpperCase());
    console.log('Base URL:', config.baseURL);
    console.log('URL:', `${config.baseURL}${config.url}`);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.groupEnd();
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - for handling common response patterns and debugging
apiClient.interceptors.response.use(
  (response) => {
    console.group('✅ API Response Success');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.group('❌ API Response Error');
    console.log('Error Object:', error);
    console.log('Error Message:', error.message);
    console.log('Error Code:', error.code);
    
    if (error.response) {
      // Server responded with error status
      console.log('Response Status:', error.response.status);
      console.log('Response Headers:', error.response.headers);
      console.log('Response Data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.log('Request made but no response:', error.request);
      console.log('This might be a CORS issue or server connectivity problem');
    } else {
      // Something else happened
      console.log('Request setup error:', error.message);
    }
    console.groupEnd();
    
    if (error.response?.status === 401) {
      console.error('🔐 Unauthorized access - clearing auth token');
      localStorage.removeItem('authToken');
    }
    
    if (error.response?.status === 403) {
      console.error('🔑 API Key missing or invalid');
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // GET request
  get: async (endpoint, params = {}) => {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  // POST request
  post: async (endpoint, data = {}) => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  // PUT request
  put: async (endpoint, data = {}) => {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  },

  // PATCH request
  patch: async (endpoint, data = {}) => {
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  // Method to update API key if needed
  setApiKey: (apiKey) => {
    apiClient.defaults.headers['x-api-key'] = apiKey;
  },

  // Method to get current API key
  getApiKey: () => {
    return API_KEY;
  },
};

// Export the axios instance if you need direct access
export { apiClient };

export default apiService;