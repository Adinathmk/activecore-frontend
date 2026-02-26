import { API_BASE } from "@/services/apiBase";

export const WISHLIST_ENDPOINTS = {
  LIST: `${API_BASE}/wishlist/`,
  COUNT: `${API_BASE}/wishlist/count/`,
  ADD: `${API_BASE}/wishlist/items/`,
  REMOVE: (id) => `${API_BASE}/wishlist/items/${id}/`,
  MOVE_TO_CART: `${API_BASE}/wishlist/move-to-cart/`,
};