import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    delivery_charge: 0,
    total_amount: 0,
    total_items_count: 0,
    free_delivery_threshold: 999,
    qualifies_for_free_delivery: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart on auth change
  const refreshCart = async () => {
    if (!isAuthenticated) {
      // Local storage fallback for guest
      const localCart = localStorage.getItem('smartcart_guest_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          setCart(parsed);
        } catch {}
      }
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'info');
      return false;
    }

    try {
      const res = await cartService.addToCart(product.id, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
        showToast(`Added "${product.name}" to cart! 🛒`, 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.updateItem(itemId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.removeItem(itemId);
      if (res.success && res.cart) {
        setCart(res.cart);
        showToast('Item removed from cart', 'info');
      }
    } catch (err) {
      showToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.clearCart();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch {}
  };

  const cartCount = cart.total_items_count || cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
