import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/features/auth/hooks/useAuth";
import banner from "@/assets/image.avif";
import { GoogleLogin } from "@react-oauth/google";


const SignInPage = () => {
  const navigate = useNavigate();
  const { loginUser, loadingLogin, sendOtp , googleLogin} = useAuth();

  // ✅ Get user from Redux
  const { user } = useSelector((state) => state.auth);

  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // ==============================
  // Redirect After Login (SAFE)
  // ==============================


  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();

      if (role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

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

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // ❌ Don't depend on return value
      await loginUser(formData);
      // Redirect handled in useEffect
    } catch (error) {
      const errorStr = JSON.stringify(error).toLowerCase();

      if (
        errorStr.includes("verified") ||
        errorStr.includes("verify") ||
        errorStr.includes("activation") ||
        errorStr.includes("inactive")
      ) {
        try {
          setIsSendingOtp(true);
          await sendOtp({ email: formData.email });
        } catch (e) {
          // silent fail
        } finally {
          setIsSendingOtp(false);
        }

        navigate("/verify-otp", { state: { email: formData.email } });
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin(credentialResponse.credential);

      const role = res.user?.role?.toLowerCase();

      if (role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error("Google login failed", error);
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
                Welcome Back
              </h1>
              <p className="text-gray-600 mt-2">
                Sign in to continue your fitness journey 💪
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loadingLogin || isSendingOtp}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loadingLogin
                  ? "Signing In..."
                  : isSendingOtp
                  ? "Redirecting & Sending OTP..."
                  : "Sign In"}
              </button>
            </form>

            <div className="flex items-center my-6">
  <div className="flex-grow border-t"></div>
  <span className="mx-4 text-gray-400 text-sm">OR</span>
  <div className="flex-grow border-t"></div>
</div>

<div className="flex justify-center">
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => console.log("Google Login Failed")}
  />
</div>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  className="text-blue-600 font-semibold"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 hidden md:block">
          <img
            src={banner}
            alt="Workout Login"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;