import axiosInstance from '@/services/axiosInstance';
import { CART_ENDPOINTS } from './cart.endpoints';

// FETCH CART
export const fetchCartAPI = async () => {
  const response = await axiosInstance.get(CART_ENDPOINTS.DETAIL);
  return response.data;
};

// ADD TO CART (Variant)
export const addToCartAPI = async (variantId, quantity = 1) => {
  const response = await axiosInstance.post(CART_ENDPOINTS.ADD, {
    variant_id: variantId,
    quantity,
  });
  return response.data;
};

// UPDATE CART ITEM QUANTITY
export const updateCartItemAPI = async (cartItemId, quantity) => {
  const response = await axiosInstance.patch(CART_ENDPOINTS.UPDATE(cartItemId), {
    quantity,
  });
  return response.data;
};

// REMOVE FROM CART
export const removeFromCartAPI = async (cartItemId) => {
  const response = await axiosInstance.delete(CART_ENDPOINTS.REMOVE(cartItemId));
  return response.data;
};

// CLEAR CART
export const clearCartAPI = async () => {
  const response = await axiosInstance.delete(CART_ENDPOINTS.CLEAR);
  return response.data;
};


export const validateCartAPI = async () => {
  const response = await axiosInstance.post(CART_ENDPOINTS.VALIDATE);
  return response.data;
};

