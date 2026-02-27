import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCartAPI,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI,
  validateCartAPI
} from './api/cart.api';
// ─────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────

// FETCH CART
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCartAPI();
      return data;   // return full cart object
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



export const validateCart = createAsyncThunk(
  "cart/validateCart",
  async (_, { rejectWithValue }) => {
    try {
      const data = await validateCartAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



// ADD ITEM TO CART
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ variantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      if (!variantId) throw new Error('Invalid variantId');

      await addToCartAPI(variantId, quantity);

      // Always resync with backend
      const data = await fetchCartAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// UPDATE CART ITEM QUANTITY
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      if (!cartItemId) throw new Error('Invalid cartItemId');

      await updateCartItemAPI(cartItemId, quantity);

      // Always resync with backend
      const data = await fetchCartAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// REMOVE ITEM FROM CART
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId, { rejectWithValue }) => {
    try {
      if (!cartItemId) throw new Error('Invalid cartItemId');

      await removeFromCartAPI(cartItemId);

      // Always resync with backend
      const data = await fetchCartAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// CLEAR CART
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await clearCartAPI();
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addToCart.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })

      // UPDATE
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })

      // REMOVE
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })

      // CLEAR
      .addCase(clearCart.fulfilled, (state) => {
        state.data = null;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(validateCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateCart.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.status === "valid") {
          state.data = action.payload.cart; // update cart
        }
      })
      .addCase(validateCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;


// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

import { createSelector } from '@reduxjs/toolkit';

// 🔹 Full cart object
export const selectCartData = (state) => state.cart.data;

// 🔹 Cart items
export const selectCartItems = createSelector(
  [selectCartData],
  (data) => data?.items || []
);

// 🔹 Cart summary (from backend)
export const selectCartSummary = createSelector(
  [selectCartData],
  (data) => ({
    subtotal: data?.subtotal || "0.00",
    tax: data?.tax_amount || "0.00",
    shipping: data?.shipping_amount || "0.00",
    total: data?.total_amount || "0.00",
    item_count: data?.item_count || 0,
  })
);

// 🔹 Loading
export const selectCartLoading = (state) =>
  state.cart.loading;

// 🔹 Variant check
export const selectIsVariantInCart = (variantId) => (state) =>
  state.cart.data?.items?.some(
    (item) => Number(item.variant) === Number(variantId)
  ) || false;

// 🔹 Product check (by slug if needed)
export const selectIsProductInCart = (productSlug) => (state) =>
  state.cart.data?.items?.some(
    (item) => item.product_slug === productSlug
  ) || false;

// 🔹 Get cart item by variant
export const selectCartItemByVariantId = (variantId) => (state) =>
  state.cart.data?.items?.find(
    (item) => Number(item.variant) === Number(variantId)
  ) || null;
