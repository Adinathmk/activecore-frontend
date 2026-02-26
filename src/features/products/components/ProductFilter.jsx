// src/features/products/components/ProductFilter.jsx
import React from "react";

// FIX: ProductFilter is now a fully controlled component.
// All state lives in Products.jsx and is passed down as props.
// This means selections always reflect the true current filter state
// and never get wiped by a re-render or remount (e.g. opening mobile drawer).

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest Arrivals" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const SIZES = ["S", "M", "L", "XL"];

export default function ProductFilter({
  onApply = () => {},
  category,
  // Controlled state from parent
  selectedSize, setSelectedSize,
  minPrice,     setMinPrice,
  maxPrice,     setMaxPrice,
  sortBy,       setSortBy,
}) {
  // No local state, no useEffect — all values come from props.

  const handleReset = () => {
    setSelectedSize("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    onApply({});
  };

  const handleApply = () => {
    const params = {};
    if (selectedSize && category !== "accessories") params.size      = selectedSize;
    if (sortBy)                                      params.sort      = sortBy;
    if (minPrice !== "")                             params.min_price = minPrice;
    if (maxPrice !== "")                             params.max_price = maxPrice;
    onApply(params);
  };

  return (
    <div className="w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-7 space-y-9">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Filters</h2>
          <p className="text-xs text-gray-400 mt-0.5">Refine your selection</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-all duration-200 px-2 py-1 rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Sort By</h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy((prev) => (prev === option.value ? "" : option.value))}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                sortBy === option.value
                  ? "border-black bg-gray-50 text-gray-900"
                  : "border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-xs font-medium">{option.label}</span>
              {sortBy === option.value && (
                <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Size</h3>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((size) => {
            const isDisabled = category === "accessories";
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => !isDisabled && setSelectedSize(isSelected ? "" : size)}
                disabled={isDisabled}
                className={`py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
                  isDisabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                    : isSelected
                    ? "border-black bg-black text-white shadow-md hover:scale-105"
                    : "border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-105"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {category === "accessories" && (
          <p className="text-xs text-gray-400">Not applicable for accessories.</p>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 font-medium">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1 font-medium">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
              <input
                type="number"
                min={minPrice || 0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full pl-7 pr-2 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-black focus:border-black transition-all bg-white"
                placeholder="Any"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apply */}
      <button
        onClick={handleApply}
        className="w-full py-3 bg-black text-white rounded-xl font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900"
      >
        Apply Filters
      </button>
    </div>
  );
}