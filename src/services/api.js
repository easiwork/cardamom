import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Process recipe text
  async processRecipe(recipeText) {
    try {
      const response = await api.post('/process-recipe', { recipeText });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to process recipe');
    }
  },

  // Process recipe URL
  async processUrl(recipeUrl) {
    try {
      const response = await api.get(`/process-url/${encodeURIComponent(recipeUrl)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to process recipe URL');
    }
  },

  // General chat
  async sendChatMessage(message, conversationHistory = []) {
    try {
      const response = await api.post('/chat', {
        message,
        conversationHistory,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send chat message');
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Health check failed');
    }
  },

  // Get example flowchart
  async getExampleFlowchart() {
    try {
      const response = await api.get('/example-flowchart');
      return response.data;
    } catch (error) {
      throw new Error('Failed to load example flowchart');
    }
  },
};

export default api;
