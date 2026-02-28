import { API_BASE } from "@/services/apiBase";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE}/auth/login/`,
  REFRESH: `${API_BASE}/auth/refresh/`,
  LOGOUT: `${API_BASE}/auth/logout/`,
  REGISTER: `${API_BASE}/auth/register/`,
  AUTH_ME: `${API_BASE}/auth/me/`,
  SEND_OTP: `${API_BASE}/auth/send-otp/`,
  VERIFY_OTP: `${API_BASE}/auth/verify-otp/`,
  FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password/`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password/`,
};