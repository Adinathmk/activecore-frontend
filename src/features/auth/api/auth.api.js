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