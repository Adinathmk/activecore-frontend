import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const VerifyOtp = () => {
  const { verifyOtp, sendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Initialize email from state if navigated from SignUp/Login
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
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

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !otp.trim()) {
      toast.error("Please provide both email and OTP.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      navigate("/login", { replace: true });
    } catch (error) {
       // Caught and toasted in useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email to resend OTP.");
      return;
    }

    setResendLoading(true);
    try {
      await sendOtp({ email });
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
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We've sent a 6-digit code to your email. Please enter it below to verify your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
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
            <label className="block text-sm font-medium mb-1 text-gray-700">6-Digit Code</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOtp}
            disabled={resendLoading || countdown > 0}
            className="mt-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? "Sending..." : countdown > 0 ? `Resend code in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
