// src/features/products/components/ProductReviewSection.jsx
import React, { useState } from 'react';
import { Star, Send, LogIn } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { rateProduct } from '@/features/products/api/product.api';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';

const ProductReviewSection = ({ slug, avgRating, ratingCount, onRefresh }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) {
      toast.info('Please select a star rating first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await rateProduct(slug, selected);
      toast.success(`You rated this product ${selected} star${selected > 1 ? 's' : ''}!`);
      setSelected(0);
      setHovered(0);
      if (onRefresh) onRefresh();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.rating?.[0] ||
        'Failed to submit rating.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = avgRating != null ? Number(avgRating).toFixed(1) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-100">
      <h2 className="text-xl font-light tracking-tight text-gray-900 mb-6">
        Ratings &amp; Reviews
      </h2>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── LEFT: Overall Rating Summary ─────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center gap-2 min-w-[160px] bg-gray-50 rounded-2xl px-8 py-6">
          <span className="text-6xl font-extralight text-gray-900 leading-none">
            {displayRating ?? '—'}
          </span>
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(avgRating ?? 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-200 fill-current'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-light mt-1">
            {ratingCount != null
              ? `${Number(ratingCount).toLocaleString()} rating${Number(ratingCount) !== 1 ? 's' : ''}`
              : 'No ratings yet'}
          </span>
        </div>

        {/* ── RIGHT: Rate This Product ──────────────────────────────────────── */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
            Rate This Product
          </h3>

          {!currentUser ? (
            /* Not logged in */
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-7 h-7 text-gray-200 fill-current" />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-light">
                  Please log in to rate this product.
                </p>
              </div>
              <button
                onClick={() => navigate('/auth/login')}
                className="flex items-center gap-2 shrink-0 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-light hover:bg-gray-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
            </div>
          ) : (
            /* Logged in — show star picker */
            <div className="flex flex-col gap-5">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setSelected(star)}
                    className="focus:outline-none group"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-9 h-9 transition-all duration-150 ${
                        star <= (hovered || selected)
                          ? 'text-yellow-400 fill-yellow-400 scale-110'
                          : 'text-gray-200 fill-gray-200 group-hover:text-yellow-200 group-hover:fill-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Label for the hovered/selected star */}
              <p className="text-sm text-gray-500 font-light h-5">
                {(hovered || selected)
                  ? [, 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || selected]
                  : 'Tap a star to rate'}
              </p>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selected}
                className="flex items-center gap-2 self-start px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-light hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewSection;
