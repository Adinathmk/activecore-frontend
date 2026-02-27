
import axiosInstance from "@/services/axiosInstance";
import { PRODUCT_ENDPOINTS } from "./product.endpoints";

export const getProducts = async (params = {}) => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.LIST, { params });
  return data.results || data;
};

export const getProductById = async (id) => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.DETAIL(id));
  return data;
};

export const getFeaturedProducts = async () => {
  const { data } = await axiosInstance.get(PRODUCT_ENDPOINTS.FEATURED);
  return data.results || data;
};