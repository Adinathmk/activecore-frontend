import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import banner from "@/assets/image.avif";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Zap } from "lucide-react";

/* ── Reusable input with icon + focus state ── */
const InputField = ({ label, name, value, onChange, error, placeholder, type = "text", icon: Icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className={`relative flex items-center rounded-2xl border bg-gray-50 transition-all duration-200
        ${error
          ? "border-red-400 bg-red-50/30"
          : focused
          ? "border-blue-400 bg-white shadow-sm shadow-blue-100"
          : "border-gray-200 hover:border-gray-300"
        }`}>
        {Icon && (
          <div className={`pl-4 transition-colors duration-200 shrink-0 ${focused ? "text-blue-500" : "text-gray-400"}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-3 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
    </div>
  );
};

/* ── Password field with eye toggle + icon ── */
const PasswordField = ({ label, name, value, onChange, error, placeholder, showPassword, onToggle }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className={`relative flex items-center rounded-2xl border bg-gray-50 transition-all duration-200
        ${error
          ? "border-red-400 bg-red-50/30"
          : focused
          ? "border-blue-400 bg-white shadow-sm shadow-blue-100"
          : "border-gray-200 hover:border-gray-300"
        }`}>
        <div className={`pl-4 transition-colors duration-200 shrink-0 ${focused ? "text-blue-500" : "text-gray-400"}`}>
          <Lock size={16} strokeWidth={2} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-3 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="pr-4 text-gray-400 hover:text-blue-500 transition-colors duration-150 focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
    </div>
  );
};

/* ── Main Component ── */
const SignUpPage = () => {
  const navigate = useNavigate();
  const { registerUser, loadingRegister, sendOtp } = useAuth();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    const cleanedPhone = formData.phone_number.replace(/[\s-]/g, "");
    if (!cleanedPhone) newErrors.phone_number = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(cleanedPhone)) newErrors.phone_number = "Enter valid phone (10–15 digits, optional +country code)";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!formData.confirm_password.trim()) newErrors.confirm_password = "Confirm your password";
    else if (formData.password !== formData.confirm_password) newErrors.confirm_password = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const { confirm_password, ...payload } = formData;
      await registerUser(payload);
      try {
        setIsSendingOtp(true);
        await sendOtp({ email: formData.email });
      } finally {
        setIsSendingOtp(false);
      }
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        const backendErrors = {};
        Object.entries(error).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
      }
    }
  };

  const isLoading = loadingRegister || isSendingOtp;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8faff 50%, #eef2ff 100%)" }}>

      <div className="flex w-full max-w-5xl bg-white rounded-3xl overflow-hidden border border-blue-50"
        style={{ boxShadow: "0 32px 80px -12px rgba(59,130,246,0.18), 0 0 0 1px rgba(59,130,246,0.06)" }}>

        {/* ── LEFT — Form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
          <div className="max-w-sm mx-auto w-full">

            {/* Brand mark */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-200">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-extrabold text-gray-900 text-lg tracking-tight">ActiveCore</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Create account
              </h1>
              <p className="text-gray-400 mt-1.5 text-sm">
                Start your fitness journey today 💪
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  placeholder="First name"
                  icon={User}
                />
                <InputField
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  placeholder="Last name"
                  icon={User}
                />
              </div>

              {/* Email */}
              <InputField
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Email address"
                icon={Mail}
              />

              {/* Phone */}
              <InputField
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                error={errors.phone_number}
                placeholder="Phone number (+91...)"
                icon={Phone}
              />

              {/* Password */}
              <PasswordField
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Password (min. 8 characters)"
                showPassword={showPassword}
                onToggle={() => setShowPassword(v => !v)}
              />

              {/* Confirm password */}
              <PasswordField
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                placeholder="Confirm password"
                showPassword={showPassword}
                onToggle={() => setShowPassword(v => !v)}
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-1 rounded-2xl font-bold text-sm text-white
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
                    {loadingRegister ? "Creating Account..." : "Sending OTP..."}
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={15} strokeWidth={2.5}
                      className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <button
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* ── RIGHT — Image ── */}
        <div className="flex-1 hidden md:block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-blue-900/20 z-10 pointer-events-none" />
          <img
            src={banner}
            alt="Workout Signup"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 px-8 py-8"
            style={{ background: "linear-gradient(to top, rgba(10,15,40,0.7) 0%, transparent 100%)" }}>
            <p className="text-white font-extrabold text-xl leading-snug">
              Built for athletes.<br />Worn by champions.
            </p>
            <p className="text-white/60 text-sm mt-1">
              Join thousands who train with ActiveCore.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;