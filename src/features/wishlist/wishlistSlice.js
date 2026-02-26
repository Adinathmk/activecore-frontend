import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchWishlistAPI,
  addWishlistItemAPI,
  removeWishlistItemAPI,
  clearWishlistAPI,
} from './api/wishlist.api';


// ─────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────

// FETCH WISHLIST
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWishlistAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// ADD SINGLE VARIANT
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (variantId, { rejectWithValue }) => {
    try {
      if (!variantId) throw new Error('Invalid variantId');

      await addWishlistItemAPI(variantId);

      // Always resync with backend
      return await fetchWishlistAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// REMOVE SINGLE VARIANT
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (variantId, { rejectWithValue }) => {
    try {
      if (!variantId) throw new Error('Invalid variantId');

      await removeWishlistItemAPI(variantId);

      // 🔥 resync instead of optimistic
      return await fetchWishlistAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// REMOVE ALL VARIANTS OF A PRODUCT (Listing Page)
export const removeProductFromWishlist = createAsyncThunk(
  'wishlist/removeProductFromWishlist',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const items = state.wishlist.items;

      const matchingItems = items.filter(
        (item) => Number(item.product?.id) === Number(productId)
      );

      for (const item of matchingItems) {
        await removeWishlistItemAPI(item.variant_id);
      }

      // 🔥 resync once after all deletions
      return await fetchWishlistAPI();

    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// CLEAR WISHLIST
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await clearWishlistAPI();
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

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })

      // REMOVE SINGLE
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })

      // REMOVE PRODUCT (ALL VARIANTS)
      .addCase(removeProductFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.error = null;
      })

      // CLEAR
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;


// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectWishlistItems = (state) => state.wishlist.items;

export const selectWishlistCount = (state) =>
  state.wishlist.items.length;

export const selectWishlistLoading = (state) =>
  state.wishlist.loading;

// Variant-level (Product Details Page)
export const selectIsVariantInWishlist = (variantId) => (state) =>
  state.wishlist.items.some(
    (item) => Number(item.variant_id) === Number(variantId)
  );

// Product-level (Listing Page)
export const selectIsProductWishlisted = (productId) => (state) =>
  state.wishlist.items.some(
    (item) => Number(item.product?.id) === Number(productId)
  );