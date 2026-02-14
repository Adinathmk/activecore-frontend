// src/pages/WishlistPage.jsx
import React, { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Heart, ShoppingBag, Trash2, Plus, Check, Grid3X3, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { handleAddToCart, isInCart ,getCartCount} = useCart();
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'

  const handleAddToCartFromWishlist = async (product) => {
    await handleAddToCart(product);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleMoveAllToCart = async () => {
    const itemsNotInCart = wishlist.filter(product => !isInCart(product.id));
    for (const product of itemsNotInCart) {
      await handleAddToCart(product);
    }
  };

  const handleClearWishlist = () => {
    clearWishlist();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      // <div className=" bg-white  h-screen flex items-center justify-center">
      //   <div className="max-w-md mx-auto  text-center">
      //     <div>
      //       <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
      //         <Heart className="w-8 h-8 text-gray-900" />
      //       </div>
      //       <h1 className="text-2xl font-semibold text-gray-900 mb-3">Your Wishlist is Empty</h1>
      //       <p className="text-gray-500 mb-8 leading-relaxed">
      //         Save your favorite items here to keep track of what you love.
      //       </p>
      //       <Link
      //         to="/products/men"
      //         className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium"
      //       >
      //         <ShoppingBag className="w-5 h-5" />
      //         Start Shopping
      //       </Link>
      //     </div>
      //   </div>
      // </div>
      <div className="max-w-md h-screen mx-auto text-center py-50 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-gray-900" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8"> Save your favorite items here to keep track of what you love.</p>
        <Link
          to="/products/men"
          className=" bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium inline-block text-center"
        >
    
              Start Shopping
      </Link>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wishlist</h1>
            <p className="text-gray-500 mt-2">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-6 lg:mt-0">
            {/* Layout Toggle Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setLayout('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  layout === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-2 rounded-lg transition-colors ${
                  layout === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              Add All to Cart
            </button>
            <button
              onClick={handleClearWishlist}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-3"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className={`${
          layout === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-6'
        }`}>
          {wishlist.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCartFromWishlist}
              onRemove={handleRemoveFromWishlist}
              isInCart={isInCart(product.id)}
              cartItemCount={getCartCount(product.id)}
              layout={layout}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to purchase?</h3>
              <p className="text-gray-500">Add all items to your cart at once</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                Add All to Cart
              </button>
              <Link
                to="/men"
                className="flex items-center gap-3 border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-white transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wishlist Card Component
function WishlistCard({ product, onAddToCart, onRemove, isInCart, cartItemCount, layout }) {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/product/${product.id}`);
  const handleRemoveClick = (e) => { e.preventDefault(); e.stopPropagation(); onRemove(product.id); };
  const handleAddToCartClick = (e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); };

  const getButtonText = () => (!isInCart ? "Add to Cart" : cartItemCount === 1 ? "Added to Cart" : `${cartItemCount} in Cart`);
  const getButtonIcon = () => (!isInCart ? <Plus className="w-4 h-4" /> : cartItemCount === 1 ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />);

  if (layout === 'list') {
    return (
      <div 
        className="group relative bg-white overflow-hidden hover:bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex">
          <div className="relative w-48 aspect-[4/5] overflow-hidden bg-gray-50">
            <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0" />
            {product.images?.[1] && <img src={product.images[1]} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105" />}
            <div className="absolute top-4 left-4">
              {product.isNewArrival && <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">New</span>}
              {product.isTopSelling && !product.isNewArrival && <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">Bestseller</span>}
              {product.discountPercentage && <span className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-full mt-2">{product.discountPercentage}% OFF</span>}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-500 mb-4 line-clamp-2">{product.description}</p>
              </div>
              <button onClick={handleRemoveClick} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all duration-200 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>}
              </div>
              <button onClick={handleAddToCartClick} className={`py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-medium flex-shrink-0 ${isInCart ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                {getButtonIcon()} <span>{getButtonText()}</span>
              </button>
            </div>

            {product.inStock !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div className="group relative bg-white overflow-hidden hover:bg-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={handleCardClick}>
      <button onClick={handleRemoveClick} className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Trash2 className="w-5 h-5 text-gray-800 hover:text-red-600 transition-colors" />
      </button>
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/5]">
        <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0" />
        {product.images?.[1] && <img src={product.images[1]} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105" />}
        <div className="absolute top-4 left-4">
          {product.isNewArrival && <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">New</span>}
          {product.isTopSelling && !product.isNewArrival && <span className="bg-black text-white text-xs tracking-wider font-light px-3 py-1.5 uppercase">Bestseller</span>}
          {product.discountPercentage && <span className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-full mt-2">{product.discountPercentage}% OFF</span>}
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAddToCartClick} className={`w-full py-4 flex items-center justify-center gap-2 transition-colors ${isInCart ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-black/90 text-white hover:bg-black'}`}>
            {getButtonIcon()} <span className="text-sm tracking-wide font-light">{getButtonText()}</span>
          </button>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-medium text-gray-900 mb-3 line-clamp-2 leading-tight">{product.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>}
          </div>
        </div>
        {product.inStock !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
