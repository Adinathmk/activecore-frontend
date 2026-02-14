// src/components/ProductCard.jsx
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { handleAddToCart, getCartItem, isInCart } = useCart();
  
  const isWishlisted = isInWishlist(product.id);
  const cartItem = getCartItem(product.id);
  const isInCartItem = isInCart(product.id);
  const itemCount = cartItem?.quantity || 0;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) { 
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(product);
  };

  const getButtonText = () => {
    if (!isInCartItem) {
      return "Add to Cart";
    }
    return itemCount === 1 ? "Added to Cart" : `${itemCount} in Cart`;
  };

  const getButtonIcon = () => {
    if (!isInCartItem) {
      return <ShoppingBag className="w-4 h-4" />;
    }
    return itemCount === 1 ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />;
  };

  return (
    <div 
      className="group relative bg-white overflow-hidden hover:bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 z-10   group-hover:opacity-100 transition-opacity duration-300 ${
          isWishlisted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Heart 
          className={`w-5 h-5 transition ${
            isWishlisted 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-800 hover:fill-gray-800'
          }`} 
        />
      </button>

      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-auto">
        {/* First Image */}
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
        />
        {/* Second Image (shown on hover) */}
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-ful h-full object-cover transition-transform duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Badges */}
        {(product.isNewArrival || product.isTopSelling) && (
          <div className="absolute top-4 left-4">
            {product.isNewArrival && (
              <span className="bg-black text-white text-xs tracking-wider font-light lg:px-3 lg:py-1.5 md:px-2 md:py-1 uppercase">
                New
              </span>
            )}
            {product.isTopSelling && !product.isNewArrival && (
              <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">
                Bestseller
              </span>
            )}
          </div>
        )}

        {/* Hover Add to Cart */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={handleCartClick}
            className={`w-full backdrop-blur-sm py-4 flex items-center justify-center gap-2 transition-colors ${
              isInCartItem
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-black/90 text-white hover:bg-black'
            }`}
          >
            {getButtonIcon()}
            <span className="text-sm tracking-wide font-light">
              {getButtonText()}
            </span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-4 pb-2 space-y-2">
        {/* Product Name */}
        <h3 className="text-base font-normal text-gray-900 leading-tight">
          {product.name}
        </h3>

        {/* Price and Color */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-lg font-light text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 font-light capitalize">
            {product.type}
          </span>
        </div>
      </div>
    </div>
  );
}