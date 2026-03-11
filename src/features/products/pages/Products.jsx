// src/features/products/pages/Products.jsx
import React, { useState, useEffect, useCallback } from "react";
import { X, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";

import ProductFilter from "@/features/products/components/ProductFilter";
import ProductGrid from "@/features/products/components/ProductGrid";

import { getProducts } from "../api/product.api";
import { ProductsPageSkeleton } from "@/shared/components/Skeleton";

export default function Products() {
  const { category } = useParams();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [products, setProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalItems, setTotalItems]     = useState(0);

  // ── Filter state lifted up here so it survives ProductFilter re-renders ───
  const [selectedSize, setSelectedSize] = useState("");
  const [minPrice, setMinPrice]         = useState("");
  const [maxPrice, setMaxPrice]         = useState("");
  const [sortBy, setSortBy]             = useState("");

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts({ category, ...params });
      if (data && data.results !== undefined) {
        setProducts(data.results);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.count || 0);
      } else {
        setProducts(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [category]);

  // ── Reset filter state + fetch fresh when category changes ────────────────
  useEffect(() => {
    setSelectedSize("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setCurrentPage(1);
    fetchProducts({ page: 1 });
  }, [fetchProducts]);

  // ── Called when user clicks Apply or Reset in ProductFilter ───────────────
  const handleApply = useCallback((params) => {
    setIsFilterOpen(false);
    setCurrentPage(1);
    fetchProducts({ ...params, page: 1 });
  }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProducts({
      size: selectedSize || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      sort: sortBy || undefined,
      page: newPage
    });
  };

  // ── Lock body scroll when mobile drawer open ──────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isFilterOpen]);

  // ── Scroll to top on page change ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const currentProducts = products;

  const categoryNames = { men: "Men", women: "Women", accessories: "Accessories" };

  const activeFilterCount = [selectedSize, sortBy, minPrice, maxPrice].filter(Boolean).length;

  if (loading)
    return <ProductsPageSkeleton />;

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error}</p>
        <button onClick={() => fetchProducts({})} className="px-6 py-2 bg-black text-white rounded-xl text-sm">
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-8xl mx-auto">
        <div className="lg:flex lg:gap-12 px-6 lg:px-12 py-12">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-32">
              <ProductFilter
                onApply={handleApply}
                category={category}
                selectedSize={selectedSize}  setSelectedSize={setSelectedSize}
                minPrice={minPrice}          setMinPrice={setMinPrice}
                maxPrice={maxPrice}          setMaxPrice={setMaxPrice}
                sortBy={sortBy}              setSortBy={setSortBy}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* Mobile top bar */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm"
              >
                <Filter size={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <span className="text-sm text-gray-400">{totalItems} items</span>
            </div>

            {/* Heading */}
            <div className="flex items-baseline justify-between mb-4">
              
              <h1 className="text-3xl font-light text-gray-900 mb-5 text-center">
                {categoryNames[category] ?? "All"}'s Collection
              </h1>
              <span className="hidden lg:block text-sm text-gray-400">
                {totalItems} items
              </span>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {sortBy && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                    {sortBy === "newest" ? "Newest" : sortBy === "price_asc" ? "Price: Low → High" : "Price: High → Low"}
                    <button
                      onClick={() => { setSortBy(""); handleApply({ size: selectedSize, min_price: minPrice, max_price: maxPrice }); }}
                      className="ml-1 hover:opacity-70 leading-none"
                    >×</button>
                  </span>
                )}
                {selectedSize && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                    Size: {selectedSize}
                    <button
                      onClick={() => { setSelectedSize(""); handleApply({ sort: sortBy, min_price: minPrice, max_price: maxPrice }); }}
                      className="ml-1 hover:opacity-70 leading-none"
                    >×</button>
                  </span>
                )}
                {minPrice && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                    Min ₹{minPrice}
                    <button
                      onClick={() => { setMinPrice(""); handleApply({ sort: sortBy, size: selectedSize, max_price: maxPrice }); }}
                      className="ml-1 hover:opacity-70 leading-none"
                    >×</button>
                  </span>
                )}
                {maxPrice && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full">
                    Max ₹{maxPrice}
                    <button
                      onClick={() => { setMaxPrice(""); handleApply({ sort: sortBy, size: selectedSize, min_price: minPrice }); }}
                      className="ml-1 hover:opacity-70 leading-none"
                    >×</button>
                  </span>
                )}
                <button
                  onClick={() => { setSelectedSize(""); setMinPrice(""); setMaxPrice(""); setSortBy(""); handleApply({}); }}
                  className="px-3 py-1 border border-gray-300 text-xs rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-lg">No products found.</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <ProductGrid products={currentProducts} />

                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2 flex-wrap items-center">
                    <button
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 disabled:opacity-30"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 border rounded text-sm transition-colors ${
                          currentPage === i + 1
                            ? "bg-black text-white border-black"
                            : "bg-white text-black hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 disabled:opacity-30"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-white overflow-y-auto">
            <ProductFilter
              onApply={handleApply}
              category={category}
              selectedSize={selectedSize}  setSelectedSize={setSelectedSize}
              minPrice={minPrice}          setMinPrice={setMinPrice}
              maxPrice={maxPrice}          setMaxPrice={setMaxPrice}
              sortBy={sortBy}              setSortBy={setSortBy}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}