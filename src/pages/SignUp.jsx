import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Use AuthContext hook
import { toast } from "react-toastify";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth(); // Get registerUser from context

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    setLoading(true);
    const response = await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role:'user',
      phone:'',
      status: "Active",
      cart:[],
      wishlist:[],
      orders:[]
    });
    setLoading(false);

    if (response.success) {
      toast.success(` Account created successfully for ${response.data.name}`);
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setSubmitted(false);
      navigate("/login"); // Navigate to login after successful signup
    } else {
      toast.error(` ${response.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Create Account</h1>
        <p className="text-gray-600 text-center mb-6">
          Join us and start your fitness journey 💪
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all duration-200 ${
              submitted && errors.name ? "border-red-500" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {submitted && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all duration-200 ${
              submitted && errors.email ? "border-red-500" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {submitted && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all duration-200 ${
              submitted && errors.password ? "border-red-500" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {submitted && errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-50 border transition-all duration-200 ${
              submitted && errors.confirmPassword ? "border-red-500" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {submitted && errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:cursor-pointer"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            className="text-blue-600 font-semibold hover:cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;