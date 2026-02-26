import { useSelector, useDispatch } from "react-redux";
import { loginUser, registerUser, logoutUser } from "../authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    currentUser: auth.user,
    loginUser: (data) => dispatch(loginUser(data)),
    registerUser: (data) => dispatch(registerUser(data)),
    logoutUser: () => dispatch(logoutUser()),
    login: (data) => dispatch(loginUser(data)),
    register: (data) => dispatch(registerUser(data)),
    logout: () => dispatch(logoutUser()),
  };
};