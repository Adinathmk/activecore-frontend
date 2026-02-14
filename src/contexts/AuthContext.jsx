import React, { createContext, useContext, useState } from "react";
import { registerUserAPI, loginUserAPI } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const registerUser = async (userData) => {
    const res = await registerUserAPI(userData);
    return res;
  };

  const loginUser = async (email, password) => {
    const res = await loginUserAPI(email, password);
    if (res.success) {  
      localStorage.setItem("user", JSON.stringify(res.data));
      setCurrentUser(res.data);
    }
    return res;
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, registerUser, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
  