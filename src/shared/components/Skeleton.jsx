// src/shared/components/Skeleton.jsx
import React from "react";

/* ── Shimmer keyframes (injected once) ──────────────────────────────────────── */
const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position: 700px 0; }
  }
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = shimmerStyle;
  document.head.appendChild(tag);
  styleInjected = true;
}

/* ── Base Skeleton ──────────────────────────────────────────────────────────── */
export default function Skeleton({ className = "", style = {}, rounded = "rounded-lg" }) {
  injectStyle();
  return (
    <div
      className={`${rounded} ${className}`}
      style={{
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "700px 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/* ── Product Card Skeleton ──────────────────────────────────────────────────── */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[3/4]" rounded="rounded-none" />

      {/* Text lines */}
      <div className="pt-4 pb-2 space-y-3">
        <Skeleton className="h-4 w-3/4" rounded="rounded" />
        <div className="flex items-baseline justify-between pt-1">
          <Skeleton className="h-5 w-20" rounded="rounded" />
          <Skeleton className="h-3 w-14" rounded="rounded" />
        </div>
      </div>
    </div>
  );
}

/* ── Products Grid Skeleton ─────────────────────────────────────────────────── */
export function ProductsGridSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Filter Sidebar Skeleton ──────────────────────────────────────────────── */
export function FilterSkeleton() {
  return (
    <div className="w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-7 space-y-9">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-16" rounded="rounded" />
          <Skeleton className="h-3 w-28" rounded="rounded" />
        </div>
        <Skeleton className="h-5 w-10" rounded="rounded-md" />
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-14" rounded="rounded" />
        <div className="space-y-1.5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-full h-10" rounded="rounded-xl" />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-8" rounded="rounded" />
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9" rounded="rounded-lg" />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" rounded="rounded" />
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-6" rounded="rounded" />
            <Skeleton className="h-8 w-full" rounded="rounded-lg" />
          </div>
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-6" rounded="rounded" />
            <Skeleton className="h-8 w-full" rounded="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <Skeleton className="w-full h-10" rounded="rounded-xl" />
    </div>
  );
}

/* ── Full Products Page Skeleton (sidebar + heading + grid) ───────────────── */
export function ProductsPageSkeleton({ count = 9 }) {
  return (
    <div className="min-h-full bg-white">
      <div className="max-w-8xl mx-auto">
        <div className="lg:flex lg:gap-12 px-6 lg:px-12 py-12">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-32">
              <FilterSkeleton />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Heading skeleton */}
            <div className="flex items-baseline justify-between mb-4">
              <Skeleton className="h-8 w-52" rounded="rounded" />
              <Skeleton className="hidden lg:block h-4 w-16" rounded="rounded" />
            </div>

            {/* Product grid skeleton */}
            <ProductsGridSkeleton count={count} />
          </main>

        </div>
      </div>
    </div>
  );
}

/* ── Product Details Skeleton ───────────────────────────────────────────────── */
export function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

          {/* Left — Image gallery */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-[4/5]" rounded="rounded-2xl" />
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" rounded="rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" rounded="rounded-full" />
              <Skeleton className="h-6 w-20" rounded="rounded-full" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-4/5" rounded="rounded" />
              <Skeleton className="h-4 w-1/3" rounded="rounded" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-4 h-4" rounded="rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-4 w-28" rounded="rounded" />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <Skeleton className="h-8 w-24" rounded="rounded" />
              <Skeleton className="h-5 w-16" rounded="rounded" />
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-5 space-y-2">
              <Skeleton className="h-4 w-full" rounded="rounded" />
              <Skeleton className="h-4 w-full" rounded="rounded" />
              <Skeleton className="h-4 w-3/4" rounded="rounded" />
            </div>

            {/* Size selectors */}
            <div className="border-t border-gray-100 pt-5">
              <Skeleton className="h-4 w-12 mb-3" rounded="rounded" />
              <div className="flex gap-3">
                {["S", "M", "L", "XL"].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-14" rounded="rounded-xl" />
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-12" rounded="rounded-xl" />
                <Skeleton className="flex-1 h-12" rounded="rounded-xl" />
              </div>
              <Skeleton className="w-full h-10" rounded="rounded-xl" />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <Skeleton className="w-10 h-10" rounded="rounded-lg" />
                  <Skeleton className="h-3 w-16" rounded="rounded" />
                  <Skeleton className="h-2 w-24" rounded="rounded" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Cart Skeleton ──────────────────────────────────────────────────────────── */
export function CartSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 pb-24 pt-12">

        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" rounded="rounded" />
            <Skeleton className="h-10 w-56" rounded="rounded" />
            <Skeleton className="h-3 w-24" rounded="rounded" />
          </div>
          <Skeleton className="w-9 h-9" rounded="rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-5 px-6 py-4">
                  <Skeleton className="w-14 aspect-[3/4]" rounded="rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" rounded="rounded" />
                    <Skeleton className="h-3 w-16" rounded="rounded" />
                  </div>
                  <Skeleton className="hidden sm:block h-4 w-16" rounded="rounded" />
                  <Skeleton className="h-8 w-24" rounded="rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-100 shadow-sm p-6">
            <Skeleton className="h-7 w-40 mb-6" rounded="rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-16" rounded="rounded" />
                  <Skeleton className="h-4 w-12" rounded="rounded" />
                </div>
              ))}
            </div>
            <div className="border-t my-5" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-12" rounded="rounded" />
              <Skeleton className="h-5 w-16" rounded="rounded" />
            </div>
            <Skeleton className="w-full h-10 mt-6" rounded="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Wishlist Skeleton ──────────────────────────────────────────────────────── */
export function WishlistSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 pb-24 pt-12">

        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" rounded="rounded" />
            <Skeleton className="h-10 w-40" rounded="rounded" />
            <Skeleton className="h-3 w-24" rounded="rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 hidden sm:block" rounded="rounded" />
            <Skeleton className="h-9 w-20" rounded="rounded" />
            <Skeleton className="h-9 w-9" rounded="rounded" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Featured Products Skeleton (Home page) ─────────────────────────────────── */
export function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <Skeleton className="w-full aspect-[3/4] shadow-xl" rounded="rounded-none" />
        </div>
      ))}
    </div>
  );
}

/* ── Orders Skeleton ────────────────────────────────────────────────────────── */
export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10" rounded="rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" rounded="rounded" />
              <Skeleton className="h-3 w-40" rounded="rounded" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-16" rounded="rounded" />
            <Skeleton className="h-6 w-20" rounded="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
