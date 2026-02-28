import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { 
  loginUser as loginThunk, 
  registerUser as registerThunk, 
  logoutUser as logoutThunk,
  updateProfile as updateProfileThunk 
} from "../authSlice";
import getErrorMessage from "@/shared/utils/getErrorMessage";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

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
      const result = await dispatch(loginThunk(data)).unwrap();
      toast.success("Login successful 🎉");
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Login failed");
      throw err;
    }
  };

  const registerUser = async (data) => {
    try {
      const result = await dispatch(registerThunk(data)).unwrap();
      toast.success("Account created successfully 🎉");
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Registration failed");
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error(err || "Logout failed");
    }
  };

  return {
    ...auth,
    currentUser: auth.user,
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    // Aliases for convenience
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateProfile: updateProfile,
  };
};