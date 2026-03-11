import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiLogin = (username, password) => API.post('/auth/login', { username, password }).then(res => res.data);
export const apiRegister = (username, email, password) => API.post('/auth/register', { username, email, password }).then(res => res.data);
export const apiGetUsers = () => API.get('/users').then(res => res.data);
export const apiUpdateUserRole = (userId, role) => API.put(`/users/${userId}/role`, { role }).then(res => res.data);

export const apiGetProducts = () => API.get('/products').then(res => res.data);
export const apiAddProduct = (p) => API.post('/products', p).then(res => res.data);
export const apiEditProduct = (id, p) => API.put(`/products/${id}`, p).then(res => res.data);
export const apiDeleteProduct = (id) => API.delete(`/products/${id}`).then(res => res.data);
export const apiGetCategories = () => API.get('/categories').then(res => res.data);

export const apiGetCart = () => API.get('/cart').then(res => res.data);
export const apiAddToCart = (product_id) => API.post('/cart', { product_id }).then(res => res.data);
export const apiUpdateCartItem = (id, quantity) => API.put(`/cart/${id}`, { quantity }).then(res => res.data);
export const apiRemoveFromCart = (id) => API.delete(`/cart/${id}`).then(res => res.data);
export const apiCheckout = () => API.post('/orders/checkout').then(res => res.data);

export const apiGetBlogs = () => API.get('/blogs').then(res => res.data);
export const apiAddBlog = (title, content) => API.post('/blogs', { title, content }).then(res => res.data);
export const apiDeleteBlog = (id) => API.delete(`/blogs/${id}`).then(res => res.data);
export const apiLikeBlog = (id) => API.post(`/blogs/${id}/like`).then(res => res.data);
export const apiAddComment = (id, text) => API.post(`/blogs/${id}/comments`, { text }).then(res => res.data);

export default API;