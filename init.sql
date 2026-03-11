-- 1. Create Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' -- 'customer' or 'admin'
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);

-- 2. Insert Mock Data

-- Insert Admin and normal user
-- Note: In a real app, passwords MUST be hashed. 
-- Here, '$2b$10$...' is a bcrypt hash for the password 'admin123' and 'user123'.
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin_user', 'admin@shop.com', '$2b$10$xyzDummyHashForAdmin123', 'admin'),
('john_doe', 'john@example.com', '$2b$10$xyzDummyHashForUser123', 'customer');

-- Insert Categories
INSERT INTO categories (name) VALUES ('Electronics'), ('Clothing');

-- Insert Products
INSERT INTO products (category_id, name, description, price, image_url) VALUES 
(1, 'Wireless Headphones', 'High quality noise-canceling headphones.', 199.99, 'https://placeholder.com/headphones.jpg'),
(1, 'Smartphone', 'Latest model with an amazing camera.', 899.50, 'https://placeholder.com/phone.jpg'),
(2, 'Cotton T-Shirt', '100% organic cotton, various sizes.', 25.00, 'https://placeholder.com/shirt.jpg');

-- Create a cart for the user and add an item to it
INSERT INTO carts (user_id) VALUES (2);
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (1, 1, 1); -- John Doe has 1 Wireless Headphone in cart