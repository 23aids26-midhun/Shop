import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total_price: 0 });
  const [loading, setLoading] = useState(false);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/cart/');
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add/', { product_id: productId, quantity });
    setCart(data);
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const { data } = await api.put(`/cart/items/${itemId}/`, { quantity });
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/`);
    setCart(data);
  }, []);

  const clearLocalCart = useCallback(() => setCart({ items: [], total_price: 0 }), []);

  const value = { cart, itemCount, loading, refreshCart, addToCart, updateItem, removeItem, clearLocalCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
