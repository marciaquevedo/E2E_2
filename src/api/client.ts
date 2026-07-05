import axios from 'axios';
import type { ApiErrorBody } from './types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from the API's error shape. */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body) {
      if (body.error) return body.error;
      const firstField = Object.values(body).find((v) => typeof v === 'string');
      if (firstField) return firstField;
    }
    if (error.message) return error.message;
  }
  return 'Algo salió mal. Intenta de nuevo.';
}
