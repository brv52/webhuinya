// src/mockApi.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATABASE ---
let mockUsers = [
  { id: 1, username: 'admin', email: 'admin@shop.com', role: 'admin', password: 'admin' },
  { id: 2, username: 'user', email: 'user@shop.com', role: 'customer', password: 'user' }
];

let mockProducts = [
  { 
    id: 1, 
    name: 'Urban Explorer Backpack', 
    price: 120.00, 
    originalPrice: 150.00, 
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 
    description: 'Water-resistant, everyday carry.' 
  },
  { 
    id: 2, 
    name: 'Minimalist Tote', 
    price: 85.00, 
    originalPrice: 100.00, 
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80', 
    description: 'Sleek design for office or casual wear.' 
  },
  { 
    id: 3, 
    name: 'Weekend Duffel', 
    price: 140.00, 
    image: 'https://images.unsplash.com/photo-1550801640-6b8efedecfac?auto=format&fit=crop&w=800&q=80', 
    description: 'Spacious and durable for short trips.' 
  },
  { 
    id: 4, 
    name: 'Tech Sling Bag', 
    price: 65.00, 
    originalPrice: 80.00, 
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80', 
    description: 'Compact, secure, perfect for gadgets.' 
  }
];

let mockCart = [];

let mockBlogs = [
  { 
    id: 1, 
    title: 'Welcome to MyShop!', 
    content: 'We are thrilled to launch our new online store. Stay tuned for amazing deals and new products dropping every week.', 
    likes: 5, 
    comments: [{ id: 1, username: 'user', text: 'Looks great! Can not wait to start shopping.' }] 
  }
];

// --- AUTH & USERS ---
export const apiLogin = async (username, password) => {
  await delay(500);
  const user = mockUsers.find(u => u.username === username && u.password === password);
  if (user) {
    const { password, ...safeUser } = user; // Don't return password
    return safeUser;
  }
  throw new Error('Invalid credentials');
};

export const apiRegister = async (username, email, password) => {
  await delay(500);
  if (mockUsers.find(u => u.username === username)) throw new Error('Username already taken');
  const newUser = { id: Date.now(), username, email, password, role: 'customer' };
  mockUsers.push(newUser);
  return { success: true };
};

export const apiGetUsers = async () => {
  await delay(300);
  return mockUsers.map(({ password, ...u }) => u); // Return users without passwords
};

export const apiUpdateUserRole = async (userId, newRole) => {
  await delay(300);
  mockUsers = mockUsers.map(u => u.id === userId ? { ...u, role: newRole } : u);
  return { success: true };
};

// --- PRODUCTS (Public & Admin) ---
export const apiGetProducts = async () => {
  await delay(300);
  return [...mockProducts];
};

export const apiAddProduct = async (product) => {
  await delay(400);
  const newProduct = { ...product, id: Date.now(), price: parseFloat(product.price) };
  mockProducts.push(newProduct);
  return { success: true, product: newProduct };
};

export const apiEditProduct = async (id, updatedData) => {
  await delay(400);
  mockProducts = mockProducts.map(p => p.id === id ? { ...p, ...updatedData, price: parseFloat(updatedData.price) } : p);
  return { success: true };
};

export const apiDeleteProduct = async (id) => {
  await delay(400);
  mockProducts = mockProducts.filter(p => p.id !== id);
  return { success: true };
};

// --- CART (User) ---
export const apiGetCart = async () => {
  await delay(300);
  return [...mockCart];
};

export const apiAddToCart = async (product) => {
  await delay(200);
  const existing = mockCart.find(item => item.product_id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    mockCart.push({ id: Date.now(), product_id: product.id, name: product.name, price: product.price, quantity: 1 });
  }
  return [...mockCart];
};

export const apiUpdateCartItem = async (itemId, quantity) => {
  await delay(200);
  if (quantity <= 0) {
    mockCart = mockCart.filter(item => item.id !== itemId);
  } else {
    mockCart = mockCart.map(item => item.id === itemId ? { ...item, quantity } : item);
  }
  return [...mockCart];
};

export const apiRemoveFromCart = async (itemId) => {
  await delay(200);
  mockCart = mockCart.filter(item => item.id !== itemId);
  return [...mockCart];
};

export const apiCheckout = async () => {
  await delay(600);
  mockCart = []; // Clear cart on successful checkout
  return { success: true, orderId: Date.now() };
};

// --- BLOG (Public & Admin) ---
export const apiGetBlogs = async () => {
  await delay(300);
  return [...mockBlogs];
};

export const apiAddBlog = async (title, content) => {
  await delay(400);
  const newBlog = { id: Date.now(), title, content, likes: 0, comments: [] };
  mockBlogs.unshift(newBlog); // Add to the top
  return { success: true, blog: newBlog };
};

export const apiDeleteBlog = async (id) => {
  await delay(400);
  mockBlogs = mockBlogs.filter(b => b.id !== id);
  return { success: true };
};

export const apiLikeBlog = async (id) => {
  await delay(200);
  mockBlogs = mockBlogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b);
  return { success: true };
};

export const apiAddComment = async (id, username, text) => {
  await delay(300);
  mockBlogs = mockBlogs.map(b => {
    if (b.id === id) {
      return { ...b, comments: [...b.comments, { id: Date.now(), username, text }] };
    }
    return b;
  });
  return { success: true };
};