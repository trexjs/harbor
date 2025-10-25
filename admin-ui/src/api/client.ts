import axios, { AxiosInstance } from "axios";

// Use relative URL to leverage Vite's proxy configuration
const API_BASE_URL = (import.meta as any)?.env?.VITE_API_URL || "";

const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/admin", // Direct connection instead of proxy
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
