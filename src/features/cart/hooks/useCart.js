import { useDispatch, useSelector } from 'react-redux';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import getErrorMessage from '@/shared/utils/getErrorMessage';
import {
  fetchCart,
  addToCart as addToCartThunk,
  updateCartItem as updateCartItemThunk,
  removeFromCart as removeFromCartThunk,
  clearCart as clearCartThunk,
  selectCartItems,
  selectCartLoading,
  selectCartSummary,
  validateCart as validateCartThunk ,
} from '../cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const cart = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);

  const refreshCart = () => {
    if (currentUser) {
      dispatch(fetchCart());
    }
  };

  // --------------------------
  // Cart actions (VARIANT BASED)
  // --------------------------

  const validateCartBeforeCheckout = async () => {
    try {
      const result = await dispatch(validateCartThunk()).unwrap();
      return result;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    }
  };

  const addToCart = async (variantId, quantity = 1) => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!variantId) {
      toast.error('Invalid variant.');
      return;
    }

    try {
      await dispatch(addToCartThunk({ variantId, quantity })).unwrap();
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const summary = useSelector(selectCartSummary);
  const refreshSummary = () => {
    if (currentUser) {
      dispatch(fetchCart());
    }
  };

  const removeFromCart = async (variantId) => {
    if (!currentUser) return;

    const cartItem = cart.find(
      (item) => Number(item.variant) === Number(variantId)
    );

    if (!cartItem) return;

    try {
      await dispatch(removeFromCartThunk(cartItem.id)).unwrap();
      toast.info('Product removed from cart');
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch(fetchCart());
    }
  };

  const updateQuantity = async (variantId, newQuantity) => {
    if (!currentUser) return;

    const cartItem = cart.find(
      (item) => Number(item.variant) === Number(variantId)
    );

    if (!cartItem) return;

    if (newQuantity < 1) {
      removeFromCart(variantId);
      return;
    }

    try {
      await dispatch(
        updateCartItemThunk({ cartItemId: cartItem.id, quantity: newQuantity })
      ).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch(fetchCart());
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;

    try {
      await dispatch(clearCartThunk()).unwrap();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // --------------------------
  // Variant-level utilities
  // --------------------------

  const isInCart = (variantId) => {
    if (!variantId) return false;

    return cart.some(
      (item) => Number(item.variant) === Number(variantId)
    );
  };

  const getCartItem = (variantId) => {
    if (!variantId) return null;

    return cart.find(
      (item) => Number(item.variant) === Number(variantId)
    );
  };

  const getCartCount = (variantId) => {
    if (!variantId) return 0;

    const item = getCartItem(variantId);
    return item ? (item.quantity || 1) : 0;
  };

  // --------------------------
  // ✅ Product-level utilities (LIKE WISHLIST)
  // --------------------------

  const isProductInCart = (productSlug) => {
    if (!productSlug) return false;

    return cart.some(
      (item) => item.product_slug === productSlug
    );
  };

  const getProductCartCount = (productSlug) => {
    if (!productSlug) return 0;

    return cart
      .filter((item) => item.product_slug === productSlug)
      .reduce((total, item) => total + item.quantity, 0);
  };

  // --------------------------

  const getCartTotal = () => {
    return summary?.total || 0;
  };

  const handleAddToCart = (variantId, quantity = 1) =>
    addToCart(variantId, quantity);

  return {
    cart,
    summary,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Variant-based
    isInCart,
    getCartItem,
    getCartCount,

    // Product-based (NEW)
    isProductInCart,
    getProductCartCount,

    getCartTotal,
    handleAddToCart,
    refreshCart,
    refreshSummary,

    validateCartBeforeCheckout,
  };
};