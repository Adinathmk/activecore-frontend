// src/components/CartPage.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/features/cart/hooks/useCart";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";
import { useState } from "react";
import CheckoutModal from "@/shared/components/BuyingModal";
import { toast } from "react-toastify";
import { CartSkeleton } from "@/shared/components/Skeleton";

const premiumStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap');
  .cart-title { font-family: 'Playfair Display', Georgia, serif; }
  .cart-row { transition: background 0.2s ease; }
  .cart-row:hover { background: #f9f9f8; }
  .cart-row-thumb { transition: transform 0.4s ease; }
  .cart-row:hover .cart-row-thumb { transform: scale(1.04); }
`;

export default function CartPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  const {
    cart,
    summary,
    updateQuantity,
    removeFromCart,
    clearCart,
    loading,
    validateCartBeforeCheckout,
  } = useCart();

  // Loading state
  if (loading || !summary) {
    return <CartSkeleton />;
  }
  const handleCheckout = async () => {
    const result = await validateCartBeforeCheckout();

    if (!result) return;

    if (result.status === "failed") {
      toast.error("Some items are unavailable. Please review your cart.");
      return;
    }

    if (result.price_updated) {
      toast.info("Some item prices were updated. Please review your cart.");
      return; // ❗ STOP here — user must click again
    }

    // Everything valid
    setIsCheckoutOpen(true);
  };

  // Empty cart
  if (!cart || cart.length === 0) {
    return (
      <>
        <style>{premiumStyles}</style>
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border border-gray-100 shadow-inner flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-7 h-7 text-gray-200" strokeWidth={1.5} />
            </div>
            <h2 className="cart-title text-3xl font-normal text-gray-900 mb-3 tracking-tight">
              Your bag is empty
            </h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
              Add pieces you love and they'll be waiting here, ready to checkout.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium tracking-widest uppercase px-8 py-3.5 hover:bg-black transition-colors"
            >
              Explore Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Backend-driven pricing
  const subtotal = Number(summary.subtotal || 0);
  const tax = Number(summary.tax || 0);
  const total = Number(summary.total || 0);
  const itemCount = summary.item_count || 0;

  return (
    <>
      <style>{premiumStyles}</style>

      <div className="min-h-screen bg-[#F8F8F7]">
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          totalAmount={total}
        />

        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 pb-24 pt-12">
          {/* Header */}
          <div className="flex items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1.5 font-medium">
                My Order
              </p>
              <h1 className="cart-title text-4xl sm:text-5xl font-normal text-gray-900 leading-none tracking-tight">
                Shopping Bag
              </h1>
              <p className="text-xs text-gray-400 mt-2 tracking-wide">
                {itemCount} {itemCount === 1 ? "piece" : "pieces"} selected
              </p>
            </div>

            <button
              onClick={clearCart}
              className="p-2.5 border border-gray-200 bg-white text-gray-300 hover:text-red-400 hover:border-red-200 transition-colors"
              title="Clear cart"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                {cart.map((item) => {
                  const variantId = item.variant;
                  const price = Number(item.unit_price || 0);
                  const availableStock = item.available_stock ?? 0;

                  return (
                    <div
                      key={variantId}
                      className="cart-row group flex items-center gap-5 px-6 py-4"
                    >
                      {/* Image */}
                      <div
                        className="w-14 aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer"
                        onClick={() =>
                          item.product_slug &&
                          navigate(`/product/${item.product_slug}`)
                        }
                      >
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="cart-row-thumb w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          item.product_slug &&
                          navigate(`/product/${item.product_slug}`)
                        }
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </p>
                        {item.size && (
                          <span className="mt-1 inline-block text-[9px] tracking-[0.12em] uppercase text-gray-400 border border-gray-200 px-1.5 py-0.5">
                            Size {item.size}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="hidden sm:block w-24 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{(item.quantity * price).toLocaleString()}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(variantId, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(variantId, item.quantity + 1)
                            }
                            disabled={item.quantity >= availableStock}
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(variantId)}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white border border-gray-100 shadow-sm p-6 sticky top-6">
                <h2 className="cart-title text-2xl mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 uppercase text-xs">
                      Free
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax (GST)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t my-5" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-gray-900 text-white py-3 uppercase text-xs tracking-widest"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}