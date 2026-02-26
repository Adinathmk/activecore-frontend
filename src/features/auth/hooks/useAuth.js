import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { 
  loginUser as loginThunk, 
  registerUser as registerThunk, 
  logoutUser as logoutThunk 
} from "../authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const loginUser = async (data) => {
    try {
      const result = await dispatch(loginThunk(data)).unwrap();
      toast.success("Login successful 🎉");
      return result;
    } catch (err) {
      toast.error(err || "Login failed");
      throw err;
    }
  };

  const registerUser = async (data) => {
    try {
      const result = await dispatch(registerThunk(data)).unwrap();
      toast.success("Account created successfully 🎉");
      return result;
    } catch (err) {
      toast.error(err || "Registration failed");
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
    // Aliases for convenience
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };
};