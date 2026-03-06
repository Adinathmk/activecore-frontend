import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  authMeRequest,
  updateProfileRequest,
} from "./api/auth.api";
import getErrorMessage from "@/shared/utils/getErrorMessage";

// ==============================
// THUNKS
// ==============================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await updateProfileRequest(data);
      return res.data;
    } catch (err) {
      if (err.response?.data) return rejectWithValue(err.response.data);
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await loginRequest(credentials);
      return res.data;
    } catch (err) {
      if (err.response?.data) return rejectWithValue(err.response.data);
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await registerRequest(data);
      return res.data;
    } catch (err) {
      if (err.response?.data) return rejectWithValue(err.response.data);
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await logoutRequest();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authMeRequest();
      return res.data;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);

// ==============================
// INITIAL STATE
// ==============================

const initialToken = localStorage.getItem("access");
// Handle "undefined" string stored in localStorage
const validInitialToken = initialToken && initialToken !== "undefined" ? initialToken : null;

let initialUser = null;
try {
  const userStr = localStorage.getItem("user");
  if (userStr && userStr !== "undefined") {
    initialUser = JSON.parse(userStr);
  }
} catch (e) {
  console.error("Failed to parse user from local storage", e);
}

const initialState = {
  user: initialUser,
  accessToken: validInitialToken,
  isAuthenticated: !!validInitialToken || !!initialUser,

  loadingLogin: false,
  loadingRegister: false,
  loadingUser: false,

  error: null,
};

// ==============================
// SLICE
// ==============================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder

      // ================= UPDATE PROFILE =================
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        if (action.payload) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      })

      // ================= LOGIN =================
      .addCase(loginUser.pending, (state) => {
        state.loadingLogin = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loadingLogin = false;

        state.accessToken = action.payload.access || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;

        if (action.payload.access) {
          localStorage.setItem("access", action.payload.access);
        } else {
          localStorage.removeItem("access");
        }

        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loadingLogin = false;
        state.error = action.payload;
      })

      // ================= REGISTER =================
      .addCase(registerUser.pending, (state) => {
        state.loadingRegister = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loadingRegister = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loadingRegister = false;
        state.error = action.payload;
      })

      // ================= LOGOUT =================
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("access");
        localStorage.removeItem("user");
      })

      // ================= LOAD USER =================
      .addCase(loadUser.pending, (state) => {
        state.loadingUser = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loadingUser = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (action.payload) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loadingUser = false;
        // We do not clear user or isAuthenticated here. 
        // If the token is truly invalid and refresh fails, the axios interceptor will dispatch `clearAuth()`.
        // If it's just a network error, we want to maintain the cached local storage state.
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;