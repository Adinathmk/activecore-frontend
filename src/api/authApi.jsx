import axiosInstance from "./axiosInstance";

// Register new user
export const registerUserAPI = async (userData) => {
  try {
    const { data: existing } = await axiosInstance.get(`/users?email=${userData.email}`);
    if (existing.length > 0) {
      return { success: false, message: "Email already registered!" };
    }

    const { data: newUser } = await axiosInstance.post("/users", userData);
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Register API Error:", error);
    return { success: false, message: error.message };
  }
};

// Login user
export const loginUserAPI = async (email, password) => {
  try {
    const { data } = await axiosInstance.get(`/users?email=${email}`);
    if (data.length === 0) return { success: false, message: "User not found" };
    
    const user = data[0];
    if (user.password !== password) return { success: false, message: "Invalid password" };
    if (user.status==='Blocked') return { success: false, message: "User is Blocked" };  

    return { success: true, data: user};

  } catch (error) {
    console.error("Login API Error:", error);
    return { success: false, message: error.message };
  }
};
