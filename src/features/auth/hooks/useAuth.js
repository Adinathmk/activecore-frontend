import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import getErrorMessage from "@/shared/utils/getErrorMessage";
import {
  sendOtpRequest,
  verifyOtpRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  googleLoginRequest 
} from "@/features/auth/api/auth.api";
import {
  loginUser as loginUserAction,
  registerUser as registerUserAction,
  logoutUser as logoutUserAction,
  updateProfile as updateProfileThunk,
  loadUser ,
} from "../authSlice";


export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { user, accessToken, isAuthenticated, loadingLogin, loadingRegister, loadingUser, error } = auth;

  const updateProfile = async (data) => {
    try {
      const result = await dispatch(updateProfileThunk(data)).unwrap();
      toast.success("Profile updated successfully 🎉");
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Profile update failed");
      throw err;
    }
  };

  const loginUser = async (data) => {
    try {
      const result = await dispatch(loginUserAction(data)).unwrap();
      toast.success("Login successful 🎉");
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Login failed");
      throw err;
    }
  };

  const registerUser = async (data) => {
    try {
      const result = await dispatch(registerUserAction(data)).unwrap();
      toast.success("Account created successfully 🎉");
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Registration failed");
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await dispatch(logoutUserAction()).unwrap();
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const sendOtp = async (data) => {
    try {
      const response = await sendOtpRequest(data);
      toast.success(response.data?.message || "OTP sent successfully!");
      return response.data;
    } catch (err) {
      toast.error(getErrorMessage(err.response?.data || err));
      throw err;
    }
  };

  const verifyOtp = async (data) => {
    try {
      const response = await verifyOtpRequest(data);
      toast.success(response.data?.message || "Account verified successfully!");
      return response.data;
    } catch (err) {
      toast.error(getErrorMessage(err.response?.data || err));
      throw err;
    }
  };

  const forgotPassword = async (data) => {
    try {
      const response = await forgotPasswordRequest(data);
      toast.success(response.data?.message || "OTP sent to email");
      return response.data;
    } catch (err) {
      toast.error(getErrorMessage(err.response?.data || err));
      throw err;
    }
  };

  const resetPassword = async (data) => {
    try {
      const response = await resetPasswordRequest(data);
      toast.success(response.data?.message || "Password reset successful");
      return response.data;
    } catch (err) {
      toast.error(getErrorMessage(err.response?.data || err));
      throw err;
    }
  };

  const googleLogin = async (token) => {
    const res = await googleLoginRequest({ token });

    const result = await dispatch(loadUser()).unwrap();


    return result;
  };

  return {
    currentUser: user,
    accessToken,
    isAuthenticated,
    loadingLogin,
    loadingRegister,
    loadingUser,
    error,
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    googleLogin,
    // Aliases for convenience
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };
};