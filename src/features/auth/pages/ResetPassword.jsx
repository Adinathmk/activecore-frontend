import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { resetPassword, forgotPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Initialize email and channel from state if navigated from ForgotPassword
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.channel) {
      setChannel(location.state.channel);
    }
  }, [location]);

  // Handle countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, new_password: newPassword, channel });
      navigate("/login", { replace: true });
    } catch (error) {
       // Caught and toasted in useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please provide an email address.");
      return;
    }

    setResendLoading(true);
    try {
      await forgotPassword({ email, channel });
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
       // Caught and toasted in useAuth
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <LockKeyhole size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Enter the 6-digit code sent to your email and choose a new password.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          {/* Display hidden channel input or read-only indicator if desired, but not strictly necessary for functionality. We'll simply submit it. */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="you@example.com"
              disabled={!!location.state?.email} // Disable if passed via state
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">6-Digit OTP Code</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Only allow numbers
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg font-semibold transition-colors"
              placeholder="------"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Re-enter password"
                required
              />
              {/* Using the same showPassword toggle ensures both are revealed at once */}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 mt-2"
          >
            {loading ? "Resetting..." : "Set New Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-100 pt-6">
          <p className="text-gray-600">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOtp}
            disabled={resendLoading || countdown > 0}
            className="mt-1 text-blue-600 font-semibold hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? "Sending..." : countdown > 0 ? `Resend code in ${countdown}s` : "Resend OTP"}
          </button>
        </div>
        
        <div className="mt-4 text-center">
             <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">Return to login</Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
