import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/features/auth/hooks/useAuth";
import banner from "@/assets/image.avif";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from "lucide-react";

const SignInPage = () => {
  const navigate = useNavigate();
  const { loginUser, loadingLogin, sendOtp, googleLogin } = useAuth();
  const { user } = useSelector((state) => state.auth);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({ email: false, password: false });

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      navigate(role === "admin" ? "/dashboard" : "/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await loginUser(formData);
    } catch (error) {
      const errorStr = JSON.stringify(error).toLowerCase();
      if (
        errorStr.includes("verified") || errorStr.includes("verify") ||
        errorStr.includes("activation") || errorStr.includes("inactive")
      ) {
        try {
          setIsSendingOtp(true);
          await sendOtp({ email: formData.email });
        } catch (e) { /* silent */ } finally { setIsSendingOtp(false); }
        navigate("/verify-otp", { state: { email: formData.email } });
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin(credentialResponse.credential);
      const role = res.user?.role?.toLowerCase();
      navigate(role === "admin" ? "/dashboard" : "/", { replace: true });
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const isLoading = loadingLogin || isSendingOtp;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8faff 50%, #eef2ff 100%)" }}>

      <div className="flex w-full max-w-5xl bg-white rounded-3xl overflow-hidden border border-blue-50"
        style={{ boxShadow: "0 32px 80px -12px rgba(59,130,246,0.18), 0 0 0 1px rgba(59,130,246,0.06)" }}>

        {/* ── LEFT — Form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-12">
          <div className="max-w-sm mx-auto w-full">

            {/* Brand mark */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-200">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-extrabold text-gray-900 text-lg tracking-tight">ActiveCore</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">
                Sign in to continue your fitness journey 💪
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email field */}
              <div>
                <div className={`relative flex items-center rounded-2xl border bg-gray-50 transition-all duration-200
                  ${errors.email
                    ? "border-red-400 bg-red-50/30"
                    : focused.email
                    ? "border-blue-400 bg-white shadow-sm shadow-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <div className={`pl-4 transition-colors duration-200 ${focused.email ? "text-blue-500" : "text-gray-400"}`}>
                    <Mail size={16} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused(f => ({ ...f, email: true }))}
                    onBlur={() => setFocused(f => ({ ...f, email: false }))}
                    placeholder="Email address"
                    className="flex-1 px-3 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <div className={`relative flex items-center rounded-2xl border bg-gray-50 transition-all duration-200
                  ${errors.password
                    ? "border-red-400 bg-red-50/30"
                    : focused.password
                    ? "border-blue-400 bg-white shadow-sm shadow-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <div className={`pl-4 transition-colors duration-200 ${focused.password ? "text-blue-500" : "text-gray-400"}`}>
                    <Lock size={16} strokeWidth={2} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused(f => ({ ...f, password: true }))}
                    onBlur={() => setFocused(f => ({ ...f, password: false }))}
                    placeholder="Password"
                    className="flex-1 px-3 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="pr-4 text-gray-400 hover:text-blue-500 transition-colors duration-150 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff size={16} strokeWidth={2} />
                      : <Eye size={16} strokeWidth={2} />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white relative overflow-hidden
                  bg-gradient-to-r from-blue-600 to-blue-500
                  shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                  flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {loadingLogin ? "Signing In..." : "Sending OTP..."}
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} strokeWidth={2.5}
                      className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Google Login Failed")}
                  width="100%"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  text="signin_with"
                />
              </div>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500 mt-7">
              Don't have an account?{" "}
              <button
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* ── RIGHT — Image ── */}
        <div className="flex-1 hidden md:block relative overflow-hidden">
          {/* Subtle overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-blue-900/20 z-10 pointer-events-none" />
          <img
            src={banner}
            alt="Workout"
            className="w-full h-full object-cover"
          />
          {/* Bottom text overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-8 py-8"
            style={{ background: "linear-gradient(to top, rgba(10,15,40,0.7) 0%, transparent 100%)" }}>
            <p className="text-white font-extrabold text-xl leading-snug">
              Train harder.<br />Recover smarter.
            </p>
            <p className="text-white/60 text-sm mt-1">
              Premium sportswear for every rep.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignInPage;