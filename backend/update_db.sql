-- update_db.sql

-- 1. Create the Blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Comments table (Linked to Blogs and Users)
CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    blog_id INT REFERENCES blogs(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert a mock blog post
INSERT INTO blogs (title, content, likes) 
VALUES ('Welcome to MyShop!', 'We are thrilled to launch our new online store with a built-in blog!', 5);

-- 4. Insert a mock comment (Assuming user with ID 2 exists from previous scripts)
INSERT INTO blog_comments (blog_id, user_id, text)
VALUES (1, 2, 'Looks great! Can not wait to start shopping.');