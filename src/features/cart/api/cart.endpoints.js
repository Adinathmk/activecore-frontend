import { API_BASE } from "@/services/apiBase";

export const CART_ENDPOINTS = {
  DETAIL: `${API_BASE}/cart/`,
  COUNT: `${API_BASE}/cart/count/`,
  ADD: `${API_BASE}/cart/add/`,
  UPDATE: (id) => `${API_BASE}/cart/items/${id}/`,
  REMOVE: (id) => `${API_BASE}/cart/items/${id}/remove/`,
  CLEAR: `${API_BASE}/cart/clear/`,
  VALIDATE: `${API_BASE}/cart/validate/`,
};