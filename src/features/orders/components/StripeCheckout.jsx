import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../api/order.payment.api";
import { toast } from "@/components/ui/sonner";

const StripeCheckout = ({ orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#1a1410", // Deep espresso
        "::placeholder": {
          color: "#c4bcb0",
        },
        fontFamily: "DM Sans, sans-serif",
        iconColor: "#c9a96e", // Gold accent
      },
      invalid: {
        color: "#e05c5c",
        iconColor: "#e05c5c",
      },
    },
    hidePostalCode: true,
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { clientSecret } = await createPaymentIntent(orderId);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess();
      }

    } catch (err) {
      setError("Payment failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border-[1.5px] border-[#e8e2d8] rounded-xl bg-[#fffcf8] hover:bg-white transition-all duration-300 focus-within:border-[#c9a96e] focus-within:ring-4 focus-within:ring-[#c9a96e]/10">
        <CardElement options={cardElementOptions} />
      </div>

      {error && <p className="text-[#e05c5c] text-sm font-medium text-center">{error}</p>}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-[#1a1410] text-[#c9a96e] py-4 rounded-xl font-['DM_Sans'] font-semibold tracking-wide hover:bg-[#2e2318] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(26,20,16,0.25)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Complete Payment securely</span>
        )}
      </button>
      
      <p className="text-[11px] font-medium tracking-wide uppercase text-center text-[#8a7f73] mt-6">
        Payments processed securely by Stripe
      </p>
    </div>
  );
};

export default StripeCheckout;