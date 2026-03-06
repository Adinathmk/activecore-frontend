import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNotificationsRequest } from "./api/notification.api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchNotificationsRequest();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch notifications");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      // Avoid duplicates from different sources
      const exists = state.list.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.list.unshift(action.payload);
        if (!action.payload.is_read) {
          state.unreadCount += 1;
        }
      }
    },
    addNotification: (state, action) => {
      // Avoid duplicates from different sources
      const exists = state.list.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.list.unshift(action.payload);
        if (!action.payload.is_read) {
          state.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
