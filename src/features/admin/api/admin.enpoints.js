import { API_BASE } from "@/services/apiBase";

export const ADMIN_USER_ENDPOINTS = {
  LIST: `${API_BASE}/admin/users/`,
  DETAIL: (id) => `${API_BASE}/admin/users/${id}/`,
  BLOCK: (id) => `${API_BASE}/admin/users/${id}/block/`,
  DELETE: (id) => `${API_BASE}/admin/users/${id}/delete/`,
};


export const ADMIN_PRODUCT_ENDPOINTS = {
  LIST: `${API_BASE}/admin/products/`,
  DETAIL: (id) => `${API_BASE}/admin/products/${id}/`,
  CATEGORIES: `${API_BASE}/admin/products/categories/`,
  TYPES: `${API_BASE}/admin/products/product-types/`,
};


export const ADMIN_ORDER_ENDPOINTS = {
  LIST: `${API_BASE}/admin/orders/`,
  DETAIL: (id) => `${API_BASE}/admin/orders/${id}/`,
  UPDATE_STATUS: (id) =>
    `${API_BASE}/admin/orders/${id}/update-status/`,
  STATS: `${API_BASE}/admin/orders/stats/`,
};