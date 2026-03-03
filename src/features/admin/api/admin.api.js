import axiosInstance from "@/services/axiosInstance";
import {
  AUTH_ADMIN_ENDPOINTS,
  PRODUCT_ADMIN_ENDPOINTS,
  ORDER_ADMIN_ENDPOINTS,
} from "./admin.endpoints";

// --- Auth Admin APIs ---
export const fetchAdminUsersApi = () =>
  axiosInstance.get(AUTH_ADMIN_ENDPOINTS.LIST_USERS);

export const deleteAdminUserApi = (id) =>
  axiosInstance.delete(AUTH_ADMIN_ENDPOINTS.DELETE(id));

export const toggleBlockAdminUserApi = (id) =>
  axiosInstance.patch(AUTH_ADMIN_ENDPOINTS.TOGGLE_BLOCK(id));

// --- Product Admin APIs ---
export const fetchAdminProductsApi = () =>
  axiosInstance.get(PRODUCT_ADMIN_ENDPOINTS.LIST_CREATE);

export const createAdminProductApi = (data) =>
  axiosInstance.post(PRODUCT_ADMIN_ENDPOINTS.LIST_CREATE, data);

export const updateAdminProductApi = (id, data) =>
  axiosInstance.put(PRODUCT_ADMIN_ENDPOINTS.DETAIL(id), data);

export const deleteAdminProductApi = (id) =>
  axiosInstance.delete(PRODUCT_ADMIN_ENDPOINTS.DETAIL(id));

// --- Order Admin APIs ---
export const fetchAdminOrdersApi = () =>
  axiosInstance.get(ORDER_ADMIN_ENDPOINTS.LIST);

export const updateAdminOrderStatusApi = (id, data) =>
  axiosInstance.patch(ORDER_ADMIN_ENDPOINTS.UPDATE_STATUS(id), data);
