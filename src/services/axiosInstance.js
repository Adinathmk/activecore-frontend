import axios from "axios";
import store from "@/app/store";
import { clearAuth } from "@/features/auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

// ==============================
// MAIN AXIOS INSTANCE
// ==============================
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // required for HttpOnly cookies
});

// ==============================
// REFRESH CLIENT (NO INTERCEPTORS)
// ==============================
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// ==============================
// PROCESS QUEUE
// ==============================
const processQueue = (error = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

// ==============================
// RESPONSE INTERCEPTOR
// ==============================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Already retried → stop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Ignore refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // Only handle 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const state = store.getState();

    // 🔥 If not authenticated → don't attempt refresh
    if (!state.auth.isAuthenticated) {
      return Promise.reject(error);
    }

    // ==========================
    // If refresh already running
    // ==========================
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(axiosInstance(originalRequest)),
          reject,
        });
      });
    }

    // ==========================
    // Start refresh process
    // ==========================
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshClient.post("/api/auth/refresh/");

      processQueue();

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // Clear redux auth state
      // store.dispatch(clearAuth());

      // Redirect only once
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;