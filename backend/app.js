const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = require('./db');
const { authenticateToken, requireAdmin } = require('./authMiddleware');
const logger = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());

// Production request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Transaction to ensure user and cart are created together
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userResult = await client.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [username, email, hashedPassword, 'customer']
            );
            const userId = userResult.rows[0].id;
            await client.query('INSERT INTO carts (user_id) VALUES ($1)', [userId]);
            await client.query('COMMIT');
            logger.info(`New user registered: ${username}`);
            res.status(201).json({ success: true });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Username or email already exists' });
        logger.error(`Registration error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        logger.info(`Successful login: ${username}`);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, role FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    const { role } = req.body;
    try {
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
        logger.info(`User ${req.params.id} role updated to ${role}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. PRODUCTS & CATEGORIES
// ==========================================

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, price, category_id, image_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, category_id, image_url]
        );
        logger.info(`New product added: ${name}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, price, category_id, image_url } = req.body;
    try {
        await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5 WHERE id = $6',
            [name, description, price, category_id, image_url, req.params.id]
        );
        logger.info(`Product ${req.params.id} updated`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        logger.info(`Product ${req.params.id} deleted`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. SHOPPING CART
// ==========================================

app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ci.id, ci.product_id, p.name, p.price, p.image_url, ci.quantity 
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            JOIN carts c ON ci.cart_id = c.id 
            WHERE c.user_id = $1 ORDER BY ci.id ASC`, [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    const { product_id } = req.body;
    try {
        let cartRes = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.userId]);
        if (cartRes.rows.length === 0) {
            cartRes = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.user.userId]);
        }
        const cartId = cartRes.rows[0].id;

        const existingItem = await pool.query('SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, product_id]);

        if (existingItem.rows.length > 0) {
            await pool.query('UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1', [existingItem.rows[0].id]);
        } else {
            await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, 1)', [cartId, product_id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cart/:id', authenticateToken, async (req, res) => {
    const { quantity } = req.body;
    try {
        if (quantity <= 0) {
            await pool.query('DELETE FROM cart_items WHERE id = $1', [req.params.id]);
        } else {
            await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, req.params.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart_items WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders/checkout', authenticateToken, async (req, res) => {
    try {
        const cartRes = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.userId]);
        await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartRes.rows[0].id]);
        logger.info(`User ${req.user.userId} completed checkout`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. BLOGS
// ==========================================

app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        for (let blog of blogs.rows) {
            const comments = await pool.query(`
                SELECT bc.*, u.username 
                FROM blog_comments bc 
                JOIN users u ON bc.user_id = u.id 
                WHERE blog_id = $1 
                ORDER BY bc.created_at ASC`, [blog.id]);
            blog.comments = comments.rows;
        }
        res.json(blogs.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/blogs', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('INSERT INTO blogs (title, content) VALUES ($1, $2) RETURNING *', [title, content]);
        logger.info(`Blog published: ${title}`);
        res.status(201).json({ blog: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
        logger.info(`Blog ${req.params.id} deleted`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/blogs/:id/like', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE blogs SET likes = likes + 1 WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/blogs/:id/comments', authenticateToken, async (req, res) => {
    const { text } = req.body;
    try {
        if (!text || text.trim() === "") return res.status(400).json({ error: "Comment empty" });
        await pool.query('INSERT INTO blog_comments (blog_id, user_id, text) VALUES ($1, $2, $3)', 
            [req.params.id, req.user.userId, text]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;