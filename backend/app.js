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
        const userResult = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, email, hashedPassword, 'customer']
        );
        const userId = userResult.rows[0].id;
        await pool.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
        
        logger.info(`User registered successfully: ${username}`);
        res.status(201).json({ success: true });
    } catch (err) {
        if (err.code === '23505') {
            logger.warn(`Registration attempt failed: Duplicate username/email - ${username}`);
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        logger.error(`Registration Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            logger.warn(`Login failed: User not found - ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            logger.warn(`Login failed: Invalid password - ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        logger.info(`User logged in: ${username}`);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, role FROM users');
        res.json(result.rows);
    } catch (err) {
        logger.error(`Fetch users error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. PRODUCTS
// ==========================================

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        logger.error(`Fetch products error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, price, category_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, category_id]
        );
        logger.info(`Product created by admin ${req.user.userId}: ${name}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error(`Create product error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. SHOPPING CART
// ==========================================

app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ci.*, p.name, p.price FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            JOIN carts c ON ci.cart_id = c.id 
            WHERE c.user_id = $1`, [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        logger.error(`Fetch cart error for user ${req.user.userId}: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
    const { product_id } = req.body;
    try {
        let cartRes = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.userId]);
        
        if (cartRes.rows.length === 0) {
            logger.info(`Auto-creating missing cart for user ${req.user.userId}`);
            cartRes = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.user.userId]);
        }
        
        const cartId = cartRes.rows[0].id;
        const existingItem = await pool.query(
            'SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, product_id]
        );

        if (existingItem.rows.length > 0) {
            await pool.query('UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1', [existingItem.rows[0].id]);
        } else {
            await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, 1)', [cartId, product_id]);
        }

        res.json({ success: true });
    } catch (err) {
        logger.error(`Cart add error for user ${req.user.userId}: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders/checkout', authenticateToken, async (req, res) => {
    try {
        const cartRes = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.userId]);
        await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartRes.rows[0].id]);
        logger.info(`Checkout successful for user ${req.user.userId}`);
        res.json({ success: true });
    } catch (err) {
        logger.error(`Checkout error for user ${req.user.userId}: ${err.message}`);
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
            const comments = await pool.query('SELECT bc.*, u.username FROM blog_comments bc JOIN users u ON bc.user_id = u.id WHERE blog_id = $1', [blog.id]);
            blog.comments = comments.rows;
        }
        res.json(blogs.rows);
    } catch (err) {
        logger.error(`Fetch blogs error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/blogs', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query('INSERT INTO blogs (title, content) VALUES ($1, $2) RETURNING *', [title, content]);
        logger.info(`Blog post created: ${title}`);
        res.status(201).json({ blog: result.rows[0] });
    } catch (err) {
        logger.error(`Blog post error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/blogs/:id/like', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE blogs SET likes = likes + 1 WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        logger.error(`Like blog error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/blogs/:id/comments', authenticateToken, async (req, res) => {
    const { text } = req.body;
    try {
        if (!text || text.trim() === "") return res.status(400).json({ error: "Comment empty" });
        await pool.query('INSERT INTO blog_comments (blog_id, user_id, text) VALUES ($1, $2, $3)', [req.params.id, req.user.userId, text]);
        res.status(201).json({ success: true });
    } catch (err) {
        logger.error(`Comment blog error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;