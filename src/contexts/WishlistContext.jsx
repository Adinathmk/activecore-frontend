// src/contexts/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // Import the auth context

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth(); // Get currentUser from AuthContext

  // Sync wishlist with authentication state
  useEffect(() => {
    if (currentUser) {
      fetchWishlist(currentUser.id);
    } else {
      // Clear wishlist when user logs out
      setWishlist([]);
    }
  }, [currentUser]); // This will trigger when currentUser changes

  const fetchWishlist = async (userId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/${userId}`);
      setWishlist(response.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your functions remain the same
  const addToWishlist = async (product) => {
    if (!currentUser) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      setLoading(true);      
      const updatedWishlist = [...wishlist, product];
      setWishlist(updatedWishlist);

      await axiosInstance.patch(`/users/${currentUser.id}`, {
        wishlist: updatedWishlist
      });

      toast.success('Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add product to wishlist');
      setWishlist(wishlist);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const updatedWishlist = wishlist.filter(item => item.id !== productId);
      setWishlist(updatedWishlist);

      await axiosInstance.patch(`/users/${currentUser.id}`, {
        wishlist: updatedWishlist
      });

      toast.info('Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove product from wishlist');
      setWishlist(wishlist);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);      
      
      await axiosInstance.patch(`/users/${currentUser.id}`, {
        wishlist: []
      });
      setWishlist([]);

      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
    refreshWishlist: () => currentUser && fetchWishlist(currentUser.id)
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};