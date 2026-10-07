import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.success && res.wishlist) {
        setWishlist(res.wishlist);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.product_id === productId || item.product?.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save items to your wishlist', 'info');
      return;
    }

    try {
      const res = await wishlistService.toggleWishlist(product.id);
      if (res.success) {
        if (res.is_in_wishlist) {
          showToast(`Saved "${product.name}" to wishlist ❤️`, 'success');
        } else {
          showToast(`Removed from wishlist`, 'info');
        }
        await refreshWishlist();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating wishlist', 'error');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    try {
      await wishlistService.removeItem(productId);
      setWishlist((prev) => prev.filter((item) => item.product_id !== productId && item.product?.id !== productId));
      showToast('Removed from wishlist', 'info');
    } catch {
      showToast('Failed to remove item', 'error');
    }
  };

  const moveToCart = async (product) => {
    if (!isAuthenticated) return;
    try {
      const res = await wishlistService.moveToCart(product.id);
      if (res.success) {
        showToast(`Moved "${product.name}" to your cart! 🛒`, 'success');
        await refreshWishlist();
        await refreshCart();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to move to cart', 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
