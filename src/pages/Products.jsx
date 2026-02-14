import React, { useState, useEffect} from "react";
import { X, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import ProductFilter from "../components/ProductFilter";
import ProductGrid from "../components/ProductGrid";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Products() {
  const { category } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

 

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get(`/products?category=${category}`);
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

    useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const categoryNames = {
    men: "Men",
    women: "Women",
    accessories: "Accessories",
  };

  // Prevent body scroll when filter is open on mobile
  useEffect(() => {
    if (isFilterOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterOpen]);

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-8xl mx-auto">
        <div className="lg:flex lg:gap-12 px-6 lg:px-12 py-12">
          {/* Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <ProductFilter products={products} onFilter={setFilteredProducts}  category={category}/>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center mb-0">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <Filter size={20} />
                <span className="font-medium">Filters</span>
              </button>
            </div>

            {/* Product Grid */}
            <div className={`${isFilterOpen ? "hidden lg:block" : "block"}` } >
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-5 text-center">
                  {categoryNames[category]}'s Collection
                </h1>
              </div>
              <div > 
                  <ProductGrid products={currentProducts} />
              </div>
              

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="relative flex justify-center mt-6 gap-2 flex-wrap">
                  <button 
                     onClick={(prev) => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === i + 1 ? "bg-black text-white" : "bg-white text-black"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                <button
                    onClick={() => setCurrentPage((prev)=>Math.min(prev + 1, totalPages))}>
                   <ArrowRight className="h-5 w-5" />
                </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 lg:hidden ${
          isFilterOpen ? "opacity-100" : "opacity-0 invisible"
        }`}
      >
        {/* Background Overlay */}
        <div
          onClick={() => setIsFilterOpen(false)}
          className={`absolute inset-0 bg-black transition-all duration-500 ${
            isFilterOpen ? "bg-opacity-50" : "bg-opacity-0"
          }`}
        ></div>

        {/* Filter Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white transform transition-transform duration-500 ease-out ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-300"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto scrollbar-none py-3">
              <div className="pl-4 pr-4">
                <ProductFilter
                  products={products}
                  onFilter={setFilteredProducts}
                  setIsFilterOpen={setIsFilterOpen}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
