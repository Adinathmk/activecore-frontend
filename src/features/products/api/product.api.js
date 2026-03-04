import axiosInstance from "@/services/axiosInstance";
import { PRODUCT_ENDPOINTS } from "./product.endpoints";

export const getProducts = async (params = {}) => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.LIST, { params });
  return data;
};

export const getProductById = async (slug) => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.DETAIL(slug));
  return data;
};

export const getFeaturedProducts = async () => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.FEATURED);
  return data.results || data;
};

/* Rate a product */
export const rateProduct = async (slug, rating) => {
  const { data } = await axiosInstance.post(PRODUCT_ENDPOINTS.RATE(slug), { rating });
  return data;
};

/* ✅ NEW: Search Products */
export const searchProducts = async (query, limit = 10) => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.SEARCH, {
    params: {
      q: query,
      limit,
    },
  });

  return data;
};