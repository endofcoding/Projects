import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const planRoute = async (start: string, end: string) => {
  try {
    const response = await apiClient.post('/routes/plan', {
      start,
      end,
    });
    return response.data;
  } catch (error) {
    console.error('Error planning route:', error);
    throw error;
  }
};

export const getSafetyInfo = async (location: string) => {
  try {
    const response = await apiClient.get(`/safety/info/${location}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching safety info:', error);
    throw error;
  }
};

export default apiClient;
