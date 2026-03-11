import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "@/features/products/api/product.api";

function SearchProductModal({ value, setIsSearchOpen, anchorRef, closeMenu }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 600 });
  const navigate = useNavigate();

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 + window.scrollX,
        width: 600,
      });
    }
  }, [anchorRef, value]);

  useEffect(() => {
    if (!value.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const data = await searchProducts(value, 10);
        setProducts(data);
      } catch (err) {
        console.error("Error searching products:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [value]);

  const modal = (
    <div
      data-search-portal="true" 
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        width: position.width,
        zIndex: 99999,
      }}
      className="bg-white border border-gray-300 rounded-lg shadow-xl p-4"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-gray-700 text-sm">
            Search: <span className="font-semibold text-black">{value}</span>
          </p>
          {products.length > 0 && !isLoading && (
            <p className="text-xs text-gray-500 mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent"></div>
            <span className="text-xs text-gray-600">Searching...</span>
          </div>
        )}
      </div>

      {/* Results */}
      {products.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                navigate(`/product/${product.slug}`);
                setIsSearchOpen(false);
                if (closeMenu) closeMenu();
              }}
            >
              <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                {product.primary_image ? (
                  <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-black truncate">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.product_type}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-black">₹{product.price}</span>
                  {product.in_stock ? (
                    <span className="text-xs text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                {product.is_in_wishlist && <span className="text-xs text-pink-600">♥ Wishlist</span>}
                {product.is_in_cart && <span className="text-xs text-blue-600">🛒 In Cart</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        value && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 font-medium">No products found</p>
            <p className="text-gray-500 text-sm mt-1">Try different keywords</p>
          </div>
        )
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200">
              <div className="w-14 h-14 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(modal, document.body);
}

export default SearchProductModal;