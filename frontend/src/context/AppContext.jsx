import { createContext, useState, useEffect } from 'react';
import * as api from '../api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    api.apiGetProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      api.apiGetCart().then(setCart).catch(() => setCart([]));
    } else {
      setCart([]);
    }
  }, [user]);

  const login = async (username, password) => {
    const data = await api.apiLogin(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]);
  };

  const addToCart = async (product) => {
    if (!user) return alert("Please log in first!");
    await api.apiAddToCart(product.id);
    setCart(await api.apiGetCart());
  };

  const updateCartQuantity = async (id, q) => {
    await api.apiUpdateCartItem(id, q);
    setCart(await api.apiGetCart());
  };

  const removeFromCart = async (id) => {
    await api.apiRemoveFromCart(id);
    setCart(await api.apiGetCart());
  };

  const checkout = async () => {
    await api.apiCheckout();
    setCart([]);
  };

  return (
    <AppContext.Provider value={{ 
      user, login, logout, products, setProducts, 
      cart, addToCart, updateCartQuantity, removeFromCart, checkout 
    }}>
      {children}
    </AppContext.Provider>
  );
};