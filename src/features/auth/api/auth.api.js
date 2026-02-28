import axios from "@/services/axiosInstance";
import { AUTH_ENDPOINTS } from "./auth.endpoints";

export const loginRequest = (data) => {
  return axios.post(AUTH_ENDPOINTS.LOGIN, data);
};

export const registerRequest = (data) => {
  return axios.post(AUTH_ENDPOINTS.REGISTER, data);
};

export const logoutRequest = () => {
  return axios.post(AUTH_ENDPOINTS.LOGOUT);
};

export const refreshRequest = () => {
  return axios.post(AUTH_ENDPOINTS.REFRESH);
};

export const authMeRequest = () => {
  return axios.get(AUTH_ENDPOINTS.AUTH_ME);
};

export const updateProfileRequest = (data) => {
  return axios.patch(AUTH_ENDPOINTS.AUTH_ME, data);
};

export const sendOtpRequest = (data) => {
  return axios.post(AUTH_ENDPOINTS.SEND_OTP, data);
};

export const verifyOtpRequest = (data) => {
  return axios.post(AUTH_ENDPOINTS.VERIFY_OTP, data);
};

export const forgotPasswordRequest = (data) => {
  return axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
};

export const resetPasswordRequest = (data) => {
  return axios.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
};