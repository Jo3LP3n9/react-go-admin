import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/admin-api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth');
      localStorage.removeItem('routes');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === New API Functions ===

export const getDeptTree = () => {
  return apiClient.get(API_ENDPOINTS.SYS_DEPT_TREE);
};

export const updateRoleDataScope = (
  roleId: number,
  payload: { dataScope: string; deptIds: number[] }
) => {
  return apiClient.put(API_ENDPOINTS.SYS_ROLE_DATA_SCOPE, {
    roleId,
    ...payload,
  });
};

export { apiClient };