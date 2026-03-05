// src/features/products/pages/ProductDetails.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Truck, Shield, RotateCcw, Star,
  Check, ShoppingBag, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'react-toastify';
import CheckoutModal from '@/shared/components/BuyingModal';
import { getProductById } from '@/features/products/api/product.api';
import ProductReviewSection from '@/features/products/components/ProductReviewSection';
import { ProductDetailsSkeleton } from '@/shared/components/Skeleton';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { slug } = useParams();
  const { addToWishlist, removeFromWishlist, isInWishlist, isVariantInWishlist } = useWishlist();
  const { handleAddToCart, getCartItem, removeFromCart, isInCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  

  // ── Fetch product by slug ─────────────────────────────────────────────────
  const fetchProduct = React.useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const data = await getProductById(slug);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ── Derived values from the variant-based API response ────────────────────
  const derived = useMemo(() => {
    if (!product) return {};

    const images = (product.images || []).map((img) => img.image_url);
    const activeVariants = (product.variants || []).filter((v) => v.is_active);

    const cheapestVariant = activeVariants.reduce((min, v) => {
      const sp = parseFloat(v.selling_price);
      return sp < parseFloat(min?.selling_price ?? Infinity) ? v : min;
    }, null);

    const price = cheapestVariant ? parseFloat(cheapestVariant.selling_price) : 0;
    const prevPrice =
      cheapestVariant && parseFloat(cheapestVariant.discount_percent) > 0
        ? parseFloat(cheapestVariant.price)
        : null;

    const sizes = activeVariants.map((v) => v.size);
    const in_stock = activeVariants.some((v) => (v.available_stock ?? 0) > 0);

    const categoryName =
      typeof product.category === 'object'
        ? product.category?.name ?? ''
        : product.category ?? '';

    const productTypeName =
      typeof product.product_type === 'object'
        ? product.product_type?.name ?? ''
        : product.product_type ?? '';

    const rating = product.avg_rating ?? null;
    const reviews = product.rating_count ?? null;

    return {
      images,
      price,
      prevPrice,
      sizes,
      activeVariants,
      in_stock,
      categoryName,
      productTypeName,
      rating,
      reviews,
    };
  }, [product]);

  // ── Auto-select the first active size when product loads ──────────────────
  useEffect(() => {
    if (derived.sizes && derived.sizes.length > 0) {
      setSelectedSize(derived.sizes[0]);
    }
  }, [derived.sizes]);

  // ── Resolve the currently selected variant object ─────────────────────────
  const selectedVariant = useMemo(() => {
    if (!derived.activeVariants || !selectedSize) return null;
    return derived.activeVariants.find((v) => v.size === selectedSize) ?? null;
  }, [derived.activeVariants, selectedSize]);
  const maxQuantity = selectedVariant?.available_stock ?? 0;
  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  // ── Not found guard ───────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  // ── Unpack derived values ─────────────────────────────────────────────────
  const {
    images,
    price,
    prevPrice,
    sizes,
    in_stock,
    categoryName,
    productTypeName,
    rating,
    reviews,
  } = derived;

  // ── Wishlist check: evaluate variant ──────────
  const resolveVariantId = () => {
    if (selectedVariant) return selectedVariant.id;
    if (derived.activeVariants && derived.activeVariants.length > 0) return derived.activeVariants[0].id;
    return null;
  };
  
  const currentVariantId = resolveVariantId();
  const isWishlisted = isVariantInWishlist(currentVariantId);

  const cartItem     = currentVariantId ? getCartItem(currentVariantId) : null;
  const isInCartItem = currentVariantId ? isInCart(currentVariantId) : false;
  const itemCount    = cartItem?.quantity || 0;
  const hasMultiple  = images.length > 1;

  const prevImage = () =>
    setActiveImage((p) => (p - 1 + images.length) % images.length);
  const nextImage = () =>
    setActiveImage((p) => (p + 1) % images.length);

  // ── Wishlist handler — requires a selected variant ────────────────────────
  const handleWishlistClick = () => {
    const isAccessory = categoryName.toLowerCase() === 'accessories';

    if (!isAccessory && !selectedVariant) {
      toast.info('Please select a size first');
      return;
    }

    if (!currentVariantId) {
      toast.error("No valid variant found for this product.");
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(currentVariantId);
    } else {
      addToWishlist(currentVariantId, product);
    }
  };


  const handleAddToCartClick = () => {
    if (!currentVariantId) {
      toast.info('Please select a size');
      return;
    }

    if (isInCartItem) {
      removeFromCart(currentVariantId);
      return;
    }

    handleAddToCart(currentVariantId, quantity);
  };

  const handleBuyNowClick = () => {
    if (!currentUser) { toast.info('Please login before buying'); return; }
    if (!selectedSize && categoryName.toLowerCase() !== 'accessories') {
      toast.info('Please select a size'); return;
    }
    setIsCheckoutOpen(true);
  };

  const cartButtonText = !isInCartItem
    ? 'Add to Cart'
    : itemCount > 1
      ? `${itemCount} in Cart`
      : '1 in Cart';

  const cartButtonIcon = !isInCartItem
    ? <ShoppingBag className="w-5 h-5" />
    : <Check className="w-5 h-5" />;

  const discount = prevPrice && prevPrice > price
    ? Math.round(((prevPrice - price) / prevPrice) * 100)
    : null;

  // ── Price shown reflects the selected variant (updates on size change) ────
const displayPrice = selectedVariant
  ? parseFloat(selectedVariant.selling_price || 0)
  : price;

const displayPrevPrice = selectedVariant
  ? parseFloat(selectedVariant.price || 0)
  : prevPrice;

// Show compared price ONLY if original price is greater
const displayDiscount =
  displayPrevPrice && displayPrevPrice > displayPrice
    ? Math.round(((displayPrevPrice - displayPrice) / displayPrevPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={[{ ...product, price: displayPrice, quantity, variant_id: currentVariantId }]}
        totalAmount={(displayPrice * quantity) * 1.18}
        isDirectBuy={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

          {/* ── LEFT: Image Gallery ──────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Main image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-2xl">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-400"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  No image
                </div>
              )}

              {/* Wishlist button */}
              <button
                onClick={handleWishlistClick}
                disabled={!selectedVariant}
                className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow transition-all hover:scale-110"
              >
                <Heart
                  className={`w-5 h-5 transition ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'
                  }`}
                />
              </button>

              {/* Arrow navigation */}
              {hasMultiple && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2.5 shadow hover:shadow-md transition-shadow"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2.5 shadow hover:shadow-md transition-shadow"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === activeImage ? 'bg-black w-4' : 'bg-black/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Out of stock overlay */}
              {!in_stock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-xs tracking-widest uppercase text-gray-500 font-light bg-white px-4 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasMultiple && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      activeImage === i
                        ? 'border-gray-900 ring-2 ring-gray-900/10'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Name + category */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.is_new_arrival && (
                  <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1 uppercase rounded-full">
                    New Arrival
                  </span>
                )}
                {product.is_top_selling && (
                  <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1 uppercase rounded-full">
                    Bestseller
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-base text-gray-500 mt-2 font-light capitalize">
                {categoryName} · {productTypeName}
              </p>
            </div>

            {/* Rating */}
            {rating != null && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-200 fill-current'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-light">
                  {rating}
                  {reviews != null && ` (${Number(reviews).toLocaleString()} reviews)`}
                </span>
              </div>
            )}

            {/* Price — updates when size changes */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-light text-gray-900">
                ₹{Number(displayPrice).toLocaleString()}
              </span>
              {displayPrevPrice && displayPrevPrice > displayPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through font-light">
                    ₹{Number(displayPrevPrice).toLocaleString()}
                  </span>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                    {displayDiscount}% off
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed font-light border-t border-gray-100 pt-5">
                {product.description}
              </p>
            )}

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 font-light text-sm">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0" />
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size selection */}
            {categoryName.toLowerCase() !== 'accessories' && sizes.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Size</h3>
                  {selectedSize && (
                    <span className="text-xs text-gray-500">
                      Selected: <strong>{selectedSize}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {derived.activeVariants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedSize((prev) => prev === variant.size ? variant.size : variant.size)}
                      disabled={variant.available_stock === 0}
                      className={`py-2.5 px-5 border rounded-xl text-sm font-light transition-all relative ${
                        selectedSize === variant.size
                          ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                          : variant.available_stock === 0
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {variant.size}
                      {/* Strikethrough line for out-of-stock sizes */}
                      {variant.available_stock === 0 && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-px bg-gray-300 absolute rotate-12" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTAs */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-light">Qty</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-light"
                  >
                    −
                  </button>
                  <span className="px-5 py-3 text-gray-900 font-light bg-gray-50 min-w-[48px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => {
                        if (!selectedVariant) return q;
                        if (q >= maxQuantity) {
                          toast.info(`Only ${maxQuantity} item(s) available`);
                          return q;
                        }
                        return q + 1;
                      })
                    }
                    disabled={
                      !selectedVariant ||
                      maxQuantity === 0 ||
                      quantity >= maxQuantity
                    }
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {in_stock ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCartClick}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-6 rounded-xl border font-light transition-all ${
                      isInCartItem
                        ? 'bg-green-600 text-white border-green-600 hover:bg-red-600 hover:border-red-600'
                        : 'bg-white text-gray-900 border-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-base">
                      {cartButtonIcon}
                      {cartButtonText}
                    </div>

                    {isInCartItem && (
                      <span className="text-xs opacity-90 tracking-wide">
                        Click to remove
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNowClick}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-light text-base rounded-xl"
                  >
                    <Truck className="w-5 h-5" />
                    Buy Now
                  </button>
                </div>
              ) : (
                <div className="py-4 text-center border border-gray-200 rounded-xl text-gray-400 text-sm tracking-widest uppercase">
                  Out of Stock
                </div>
              )}

              {/* Wishlist CTA below buttons — secondary action */}
              <button
                onClick={handleWishlistClick}
                disabled={!selectedVariant}
                className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl border font-light text-sm transition-all ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                />
                {isWishlisted
                  ? `Remove from Wishlist${selectedSize ? ` (Size ${selectedSize})` : ''}`
                  : `Add to Wishlist${selectedSize ? ` (Size ${selectedSize})` : ''}`}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { Icon: Truck,     title: 'Free Shipping', sub: 'On orders over ₹500' },
                { Icon: RotateCcw, title: 'Easy Returns',   sub: '30-day return policy' },
                { Icon: Shield,    title: 'Secure Payment', sub: '100% secure checkout' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 font-light mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ──────────────────────────────────────────────── */}
      <ProductReviewSection
        slug={slug}
        avgRating={product.avg_rating}
        ratingCount={product.rating_count}
        onRefresh={fetchProduct}
      />
    </div>
  );
};

export default ProductDetails;