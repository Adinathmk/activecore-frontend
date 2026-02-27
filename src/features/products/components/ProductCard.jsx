// src/features/products/components/ProductCard.jsx

import { Heart, ShoppingBag, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeProductFromWishlist,
  selectIsProductWishlisted,
} from "@/features/wishlist/wishlistSlice";
import { useCart } from "@/features/cart/hooks/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "react-toastify";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleAddToCart, getCartItem } = useCart();
  const { currentUser } = useAuth();

  const isWishlisted = useSelector(
    selectIsProductWishlisted(product.id)
  );

  const defaultVariantId = product?.variant_id || null;

  const isInCartItem = product.is_in_cart;
  const cartItem = getCartItem(product.id);
  const itemCount = cartItem?.quantity || 0;

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isWishlisted) {
      dispatch(removeProductFromWishlist(product.id));
      toast.info("Product removed from wishlist!");
    } else {
      if (!defaultVariantId) return;
      dispatch(addToWishlist(defaultVariantId));
      toast.success("Product added to wishlist!");
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart({
      ...product,
      variant_id: defaultVariantId,
    });
  };

  const getButtonText = () => {
    if (!isInCartItem) return "Add to Cart";
    return itemCount === 1 ? "Added to Cart" : `${itemCount} in Cart`;
  };

  const getButtonIcon = () => {
    if (!isInCartItem) return <ShoppingBag className="w-4 h-4" />;
    return itemCount === 1
      ? <Check className="w-4 h-4" />
      : <ShoppingBag className="w-4 h-4" />;
  };

  return (
    <div
      className="group relative bg-white overflow-hidden hover:bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <button
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 z-10 group-hover:opacity-100 transition-opacity duration-300 ${
          isWishlisted ? "opacity-100" : "opacity-0"
        }`}
      >
        <Heart
          className={`w-5 h-5 transition ${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-800 hover:fill-gray-800"
          }`}
        />
      </button>

      <div className="relative overflow-hidden bg-gray-50 aspect-auto">
        <img
          src={product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
        />

        {product.secondary_image && (
          <img
            src={product.secondary_image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-gray-500 font-light">
              Out of Stock
            </span>
          </div>
        )}

        {product.in_stock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleCartClick}
              className={`w-full backdrop-blur-sm py-4 flex items-center justify-center gap-2 transition-colors ${
                isInCartItem
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-black/90 text-white hover:bg-black"
              }`}
            >
              {getButtonIcon()}
              <span className="text-sm tracking-wide font-light">
                {getButtonText()}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 pb-2 space-y-2">
        <h3 className="text-base font-normal text-gray-900 leading-tight">
          {product.name}
        </h3>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-lg font-light text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 font-light capitalize">
            {product.product_type}
          </span>
        </div>
      </div>
    </div>
  );
}