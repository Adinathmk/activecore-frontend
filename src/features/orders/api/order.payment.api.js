import axiosInstance from "@/services/axiosInstance";
import { ORDER_ENDPOINTS } from "./orders.endpoints";

export const createPaymentIntent = async (orderId) => {
  const { data } = await axiosInstance.post(
    ORDER_ENDPOINTS.CREATE_PAYMENT_INTENT(orderId)
  );
  return data;
};