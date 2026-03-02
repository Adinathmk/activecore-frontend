import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/services/stripe";
import StripeCheckout from "../components/StripeCheckout";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] py-16 px-4 sm:px-6 lg:px-8 font-['DM_Sans']">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#8a7f73] hover:text-[#1a1410] transition-colors mb-10 group"
        >
          <div className="w-8 h-8 rounded-full border border-[#e8e2d8] flex items-center justify-center group-hover:border-[#1a1410] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium tracking-wide text-xs uppercase">Return to Order</span>
        </button>

        <div className="bg-white rounded-3xl border border-[#e8e2d8] p-10 shadow-[0_32px_80px_-8px_rgba(0,0,0,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e0d5c5] via-[#c9a96e] to-[#e0d5c5]" />
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fffdf9] border border-[#f0ebe3] mb-6 shadow-sm">
              <Lock className="w-7 h-7 text-[#c9a96e]" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-['Playfair_Display'] text-[#1a1410] tracking-tight mb-2">Secure Payment</h1>
            <p className="text-sm text-[#8a7f73] font-medium tracking-wide uppercase">Order #{orderId.split("-")[0]}</p>
          </div>

          <Elements stripe={stripePromise}>
            <StripeCheckout orderId={orderId} onSuccess={handleSuccess} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;