import { API_BASE } from "@/services/apiBase";

// 🔐 Auth Admin
export const AUTH_ADMIN_ENDPOINTS = {
  LIST_USERS: `${API_BASE}/auth/admin/users/`,
  SEARCH_USERS: `${API_BASE}/auth/admin/users/search/`,
  DETAIL: (id) => `${API_BASE}/auth/admin/users/${id}/`,
  TOGGLE_BLOCK: (id) => `${API_BASE}/auth/admin/users/${id}/block/`,
  DELETE: (id) => `${API_BASE}/auth/admin/users/${id}/delete/`,
};

// 📦 Products Admin
export const PRODUCT_ADMIN_ENDPOINTS = {
  LIST_CREATE: `${API_BASE}/products/admin/`,
  SEARCH_PRODUCTS: `${API_BASE}/products/admin/search/`,
  DETAIL: (id) => `${API_BASE}/products/admin/${id}/`,
  CATEGORIES: `${API_BASE}/products/admin/categories/`,
  PRODUCT_TYPES: `${API_BASE}/products/admin/product-types/`,
  VARIANTS_LIST_CREATE: `${API_BASE}/products/admin/variants/`,
  VARIANTS_DETAIL: (id) => `${API_BASE}/products/admin/variants/${id}/`,
};

// 🧾 Orders Admin
export const ORDER_ADMIN_ENDPOINTS = {
  LIST: `${API_BASE}/orders/admin/`,
  SEARCH_ORDERS: `${API_BASE}/orders/admin/search/`,
  DETAIL: (id) => `${API_BASE}/orders/admin/${id}/`,
  UPDATE_STATUS: (id) => `${API_BASE}/orders/admin/${id}/update-status/`,
  STATS: `${API_BASE}/orders/adimn/stats/`, // Matching backend adimn typo
};
