import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import banner from "@/assets/image.avif";
import { Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { registerUser, loadingRegister } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";

    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation (matches backend regex)
    const cleanedPhone = formData.phone_number.replace(/[\s-]/g, "");
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!cleanedPhone) {
      newErrors.phone_number = "Phone number is required";
    } else if (!phoneRegex.test(cleanedPhone)) {
      newErrors.phone_number =
        "Enter valid phone (10–15 digits, optional +country code)";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const { confirm_password, ...payload } = formData;

      await registerUser(payload);
      navigate("/login");
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        const backendErrors = {};
        Object.entries(error).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value)
            ? value[0]
            : value;
        });
        setErrors(backendErrors);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

        {/* LEFT SIDE */}
        <div className="flex-1 p-10">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900">
                Create Account
              </h1>
              <p className="text-gray-600 mt-2">
                Start your fitness journey today 💪
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <InputField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                placeholder="John"
              />

              <InputField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                placeholder="Doe"
              />

              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
              />

              {/* PHONE NUMBER */}
              <InputField
                label="Phone Number"
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={errors.phone_number}
                placeholder="+919876543210"
              />

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
                      errors.password ? "border-red-500" : "border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <InputField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                placeholder="Re-enter password"
              />

              <button
                type="submit"
                disabled={loadingRegister}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loadingRegister ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  className="text-blue-600 font-semibold"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 hidden md:block">
          <img
            src={banner}
            alt="Workout Signup"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
        error ? "border-red-500" : "border-gray-200"
      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder={placeholder}
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">{error}</p>
    )}
  </div>
);

export default SignUpPage;