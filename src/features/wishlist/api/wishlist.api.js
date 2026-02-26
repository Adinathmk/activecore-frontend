import axiosInstance from '@/services/axiosInstance';
import { WISHLIST_ENDPOINTS } from './wishlist.endpoints';

/** GET /api/wishlist/ — returns array of WishlistItem */
export const fetchWishlistAPI = async () => {
  const { data } = await axiosInstance.get(WISHLIST_ENDPOINTS.LIST);
  return data.results || data;
};

/** POST /api/wishlist/items/ — body: { variant_id } */
export const addWishlistItemAPI = async (variantId) => {
  const { data } = await axiosInstance.post(WISHLIST_ENDPOINTS.ADD, { variant_id: variantId });
  return data;
};

/** DELETE /api/wishlist/items/<variant_id>/ */
export const removeWishlistItemAPI = async (variantId) => {
  console.log("variantId", variantId);
  const { data } = await axiosInstance.delete(WISHLIST_ENDPOINTS.REMOVE(variantId));
  return data;
};

/** DELETE /api/wishlist/ — clears entire wishlist */
export const clearWishlistAPI = async () => {
  const { data } = await axiosInstance.delete(WISHLIST_ENDPOINTS.LIST);
  return data;
};
