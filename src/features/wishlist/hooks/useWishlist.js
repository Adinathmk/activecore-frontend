import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAuth } from "@/features/auth/hooks/useAuth";
import getErrorMessage from "@/shared/utils/getErrorMessage";

import {
  fetchWishlist,
  addToWishlist as addToWishlistThunk,
  removeFromWishlist as removeFromWishlistThunk,
  clearWishlist as clearWishlistThunk,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistCount,
  selectIsVariantInWishlist,
} from "../wishlistSlice";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const items = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const count = useSelector(selectWishlistCount);

  // ✅ ADD (Variant Only)
  const addToWishlist = async (variantId) => {
    if (!currentUser) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (!variantId) {
      toast.error("No variant found for this product.");
      return;
    }

    try {
      await dispatch(addToWishlistThunk(variantId)).unwrap();
      toast.success("Product added to wishlist!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // ✅ REMOVE (Variant Only)
  const removeFromWishlist = async (variantId) => {
    if (!currentUser) return;

    if (!variantId) {
      toast.error("No variant found.");
      return;
    }

    try {
      await dispatch(removeFromWishlistThunk(variantId)).unwrap();
      toast.info("Product removed from wishlist");
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch(fetchWishlist()); // restore correct server state
    }
  };

  // ✅ VARIANT BASED CHECK (Fixed to avoid violating Rules of Hooks)
  const isVariantInWishlist = (variantId) => {
    if (!variantId) return false;
    return items.some((item) => {
      const itemVariantId = item.variant_id || item.variant?.id || item.variant;
      return String(itemVariantId) === String(variantId);
    });
  };

  const clearWishlist = async () => {
    if (!currentUser) return;

    try {
      await dispatch(clearWishlistThunk()).unwrap();
      toast.success("Wishlist cleared");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const refreshWishlist = () => {
    if (currentUser) dispatch(fetchWishlist());
  };

  return {
    wishlist: items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isVariantInWishlist,
    clearWishlist,
    wishlistCount: count,
    refreshWishlist,
  };
};