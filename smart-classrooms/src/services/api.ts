import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { clearStoredAuth, getStoredToken } from "../utils/authStorage";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isLoginRequest = requestUrl.includes("/api/v1/auth/login");

    if (status === 401 && !isLoginRequest) {
      // Handle unauthorized
      clearStoredAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
