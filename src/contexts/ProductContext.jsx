// src/context/ProductContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);   // all products
  const [loading, setLoading] = useState(true);   // loading state
  const [error, setError] = useState(null);       // error state

  // Fetch products using Axios
  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("/products"); // fetch products
      setProducts(data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);  
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context easily
export const useProducts = () => useContext(ProductContext);
