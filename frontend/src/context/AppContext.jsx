// src/context/AppContext.jsx
import { createContext, useState, useEffect } from 'react';
import { apiGetProducts, apiGetCart, apiAddToCart, apiUpdateCartItem, apiRemoveFromCart, apiCheckout } from '../mockApi';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    apiGetProducts().then(setProducts);
    if (user) {
      apiGetCart().then(setCart);
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (product) => {
    if (!user) return alert("Please log in first!");
    const updatedCart = await apiAddToCart(product);
    setCart(updatedCart);
  };

  const updateCartQuantity = async (itemId, quantity) => {
    const updatedCart = await apiUpdateCartItem(itemId, quantity);
    setCart(updatedCart);
  };

  const removeFromCart = async (itemId) => {
    const updatedCart = await apiRemoveFromCart(itemId);
    setCart(updatedCart);
  };

  const checkout = async () => {
    await apiCheckout();
    setCart([]);
    alert("Checkout successful! Order placed.");
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, products, setProducts, cart, addToCart, 
      updateCartQuantity, removeFromCart, checkout, logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};