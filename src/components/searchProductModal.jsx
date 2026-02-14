import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function SearchProductModal({ value , setIsSearchOpen }) {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate=useNavigate();

    useEffect(() => {
        const searchTerm = normalize(value);
        if (!searchTerm) {   
            setProducts([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const fetchProducts = async () => {
            try {
                const res = await axiosInstance.get("/products");
                const filtered = res.data.filter((product) =>
                    normalize(product.name).includes(searchTerm)
                );

                setProducts(filtered);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const delay = setTimeout(fetchProducts, 300);
        return () => clearTimeout(delay);
    }, [value]);

    function normalize(str) {
        return str.toLowerCase().replace(/[^a-z]/g, ""); 
    }
    return (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[520px] bg-white border  border-gray-300 rounded-lg shadow-xl p-4 z-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-gray-700 text-sm">
                        Search: <span className="font-semibold text-black">{value}</span>
                    </p>
                    {products.length > 0 && !isLoading && (
                        <p className="text-xs text-gray-500 mt-1">
                            {products.length} product{products.length !== 1 ? 's' : ''} found
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
                            key={product._id || product.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                            onClick={() =>{ navigate(`/product/${product.id}`);setIsSearchOpen(false)}}
                        >
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                {product.images && product.images[0] ? (
                                    <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-black truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                            {product.description}
                                        </p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                value && !isLoading && (
                    <div className="text-center py-8">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
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
                            <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchProductModal;