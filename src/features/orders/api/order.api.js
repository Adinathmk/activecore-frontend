import axiosInstance from "@/services/axiosInstance";
import { ORDER_ENDPOINTS } from "./orders.endpoints";

// Create a new order via checkout endpoint
export const checkoutOrderAPI = async (payload) => {
  const { data } = await axiosInstance.post(ORDER_ENDPOINTS.CHECKOUT, payload);
  return data;
};

// Fetch user orders
export const getOrdersAPI = async () => {
  const { data } = await axiosInstance.get(ORDER_ENDPOINTS.LIST);
  return data;
};

// Fetch account overview stats
export const getAccountOverviewAPI = async () => {
  const { data } = await axiosInstance.get(ORDER_ENDPOINTS.ACCOUNT_OVERVIEW);
  return data;
};
