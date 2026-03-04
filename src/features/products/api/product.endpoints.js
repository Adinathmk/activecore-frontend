import { API_BASE } from "@/services/apiBase";

export const PRODUCT_ENDPOINTS = {
  LIST: `${API_BASE}/products/`,
  DETAIL: (slug) => `${API_BASE}/products/${slug}/`,
  RATE: (slug) => `${API_BASE}/products/${slug}/rate/`,
  FEATURED: `${API_BASE}/products/home/featured/`,
  SEARCH: `${API_BASE}/products/search/`, 
};