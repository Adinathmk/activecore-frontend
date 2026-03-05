import React, { useState } from "react";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useCart } from "@/features/cart/hooks/useCart";
import {
  Heart,
  Trash2,
  Plus,
  Check,
  Grid3X3,
  List,
  ShoppingBag,
  X,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { WishlistSkeleton } from "@/shared/components/Skeleton";

/* ─── Tiny inline styles for things Tailwind can't do ─── */
const premiumStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap');

  .wl-title {
    font-family: 'Playfair Display', Georgia, serif;
    letter-spacing: -0.02em;
  }

  .wl-card-grid {
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .wl-card-grid:hover {
    box-shadow: 0 20px 60px -10px rgba(0,0,0,0.14);
    transform: translateY(-4px);
  }

  .wl-overlay-btn {
    transform: translateY(100%);
    transition: transform 0.25s cubic-bezier(0.33,1,0.68,1);
  }

  .wl-card-grid:hover .wl-overlay-btn {
    transform: translateY(0%);
  }

  .wl-img {
    transition: transform 0.6s cubic-bezier(0.33,1,0.68,1);
  }

  .wl-card-grid:hover .wl-img {
    transform: scale(1.06);
  }

  .wl-remove-pill {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .wl-card-grid:hover .wl-remove-pill {
    opacity: 1;
  }

  .wl-row-thumb {
    transition: transform 0.4s ease;
  }

  .wl-row:hover .wl-row-thumb {
    transform: scale(1.04);
  }
`;

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { handleAddToCart, isInCart } = useCart();
  const [layout, setLayout] = useState("grid");

  const handleRemoveFromWishlist = (variantId) => {
    if (!variantId) return;
    removeFromWishlist(Number(variantId));
  };

  const handleMoveAllToCart = async () => {
  for (const item of wishlist) {
    if (!isInCart(item.variant_id)) {
      await handleAddToCart(item.variant_id, 1);
    }
  }

  await clearWishlist();
};

  if (loading) {
    return <WishlistSkeleton />;
  }

  if (wishlist.length === 0) {
    return (
      <>
        <style>{premiumStyles}</style>
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border border-gray-100 shadow-inner flex items-center justify-center mx-auto mb-6">
              <Heart className="w-7 h-7 text-gray-200" strokeWidth={1.5} />
            </div>
            <h2 className="wl-title text-3xl font-normal text-gray-900 mb-3 tracking-tight">
              Nothing saved yet
            </h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
              Items you love will live here — curated, remembered, ready.
            </p>
            <Link
              to="/products/men"
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium tracking-widest uppercase px-8 py-3.5 hover:bg-black transition-colors"
            >
              Explore Collection <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  const itemsNotInCart = wishlist.filter((item) => !isInCart(item.product?.id));

  return (
    <>
      <style>{premiumStyles}</style>
      <div className="min-h-screen bg-[#F8F8F7]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 pb-24 pt-12">

          {/* ── Header ── */}
          <div className="flex items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1.5 font-medium">
                My Collection
              </p>
              <h1 className="wl-title text-4xl sm:text-5xl font-normal text-gray-900 leading-none tracking-tight">
                Wishlist
              </h1>
              <p className="text-xs text-gray-400 mt-2 tracking-wide">
                {wishlist.length} {wishlist.length === 1 ? "piece" : "pieces"} saved
              </p>
            </div>

            <div className="flex items-center gap-3 pb-1">
              {/* Add all */}
              {itemsNotInCart.length > 0 && (
                <button
                  onClick={handleMoveAllToCart}
                  className="hidden sm:flex items-center gap-2 border border-gray-900 text-gray-900 text-[11px] font-medium tracking-widest uppercase px-5 py-2.5 hover:bg-gray-900 hover:text-white transition-all duration-200"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add all to bag
                </button>
              )}

              {/* Layout toggle */}
              <div className="flex border border-gray-200 bg-white">
                <button
                  onClick={() => setLayout("grid")}
                  className={`p-2.5 transition-colors ${
                    layout === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayout("list")}
                  className={`p-2.5 transition-colors ${
                    layout === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clear */}
              <button
                onClick={clearWishlist}
                className="p-2.5 border border-gray-200 bg-white text-gray-300 hover:text-red-400 hover:border-red-200 transition-colors"
                title="Clear wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Grid ── */}
          {layout === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {wishlist.map((item) => (
                <GridCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveFromWishlist}
                  onAddToCart={handleAddToCart}
                  isInCart={isInCart(item.variant_id)}
                />
              ))}
            </div>
          ) : (
            /* ── List ── */
            <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
              {wishlist.map((item) => (
                <ListRow
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveFromWishlist}
                  onAddToCart={handleAddToCart}
                  isInCart={isInCart(item.variant_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   Grid Card
───────────────────────────────────────── */
function GridCard({ item, onRemove, onAddToCart, isInCart }) {
  const navigate = useNavigate();
  const product = item.product || {};
  const size = item.size || item.variant?.size;
  const variantId = item.variant_id;

  if (!product.id) return null;

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await onAddToCart(variantId, 1);
    await onRemove(variantId);
  };

  return (
    <div
      className="group relative bg-white overflow-hidden hover:bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Remove Button (Same fade logic as heart) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(variantId);
        }}
        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <X className="w-5 h-5 text-gray-800 hover:text-red-500 transition" />
      </button>

      {/* Image Wrapper — EXACT same structure */}
      <div className="relative overflow-hidden bg-gray-50 aspect-auto">
        {/* Primary Image */}
        <img
          src={product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
        />

        {/* Secondary Image */}
        {product.secondary_image && (
          <img
            src={product.secondary_image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Out of Stock */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-gray-500 font-light">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badge */}
        {(product.is_new_arrival || product.is_top_selling) && (
          <div className="absolute top-4 left-4">
            {product.is_new_arrival && (
              <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">
                New
              </span>
            )}
            {product.is_top_selling && !product.is_new_arrival && (
              <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">
                Bestseller
              </span>
            )}
          </div>
        )}

        {/* Slide-Up Add to Cart — EXACT same animation */}
        {product.in_stock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleCartClick}
              className={`w-full backdrop-blur-sm py-4 flex items-center justify-center gap-2 transition-colors ${
                isInCart
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-black/90 text-white hover:bg-black"
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm tracking-wide font-light">
                    Added to Cart
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm tracking-wide font-light">
                    Add to Cart
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="pt-4 pb-2 space-y-2">
        <h3 className="text-base font-normal text-gray-900 leading-tight">
          {product.name}
        </h3>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-lg font-light text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>

          {size && (
            <span className="text-xs text-gray-400 font-light uppercase">
              {size}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   List Row
───────────────────────────────────────── */
function ListRow({ item, onRemove, onAddToCart, isInCart }) {
  const navigate = useNavigate();
  const product = item.product || {};
  const size = item.size || item.variant?.size;
  const variantId = item.variant_id;

  if (!product.id) return null;

  return (
    <div
      onClick={() => product.slug && navigate(`/product/${product.slug}`)}
      className="wl-row group flex items-center gap-5 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      {/* Thumb */}
      <div className="w-14 flex-shrink-0 aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={product.primary_image}
          alt={product.name}
          className="wl-row-thumb w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        {size && (
          <span className="mt-1 inline-block text-[9px] tracking-[0.12em] uppercase text-gray-400 border border-gray-200 px-1.5 py-0.5">
            Size {size}
          </span>
        )}
      </div>

      {/* Price */}
      <span className="hidden sm:block text-sm font-semibold text-gray-900 flex-shrink-0 w-20 text-right">
        ₹{product.price}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() =>onAddToCart(variantId, 1)}
          className={`flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase px-4 py-2 transition-all duration-200 ${
            isInCart
              ? "bg-gray-50 text-green-700 border border-gray-200"
              : "bg-gray-900 text-white hover:bg-black"
          }`}
        >
          {isInCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isInCart ? "Added" : "Add to Bag"}
        </button>

        <button
          onClick={() => onRemove(variantId)}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 border border-transparent hover:border-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}