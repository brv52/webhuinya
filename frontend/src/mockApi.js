const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATABASE ---
let mockUsers = [
  { id: 1, username: 'admin', email: 'admin@shop.com', role: 'admin', password: 'admin' },
  { id: 2, username: 'user', email: 'user@shop.com', role: 'customer', password: 'user' }
];

let mockProducts = [
  { id: 1, name: 'Wireless Headphones', price: 199.99, description: 'Noise-canceling.' },
  { id: 2, name: 'Smartphone', price: 899.50, description: 'Latest model.' }
];
let mockCart = [];

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