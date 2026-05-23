import axios from "axios";

export const AUTH_TOKEN_STORAGE_KEY = "ai_workflow_access_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from backend response
    if (error.response?.data?.message) {
      const backendError = new Error(error.response.data.message);
      return Promise.reject(backendError);
    }

    // Fall back to default error message
    return Promise.reject(error);
  }
);