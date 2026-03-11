const pool = require('./db');
const bcrypt = require('bcrypt');
const logger = require('./logger');

async function seed() {
  const client = await pool.connect();
  try {
    logger.info("Starting massive database seeding (25+ items)...");
    await client.query('BEGIN');

    await client.query(`
      TRUNCATE users, products, categories, carts, cart_items, blogs, blog_comments 
      RESTART IDENTITY CASCADE
    `);

    logger.info("Seeding categories...");
    const categoryNames = ['Backpacks', 'Totes', 'Slings', 'Accessories', 'Travel', 'Limited'];
    const categoryIds = {};
    for (const name of categoryNames) {
      const res = await client.query("INSERT INTO categories (name) VALUES ($1) RETURNING id", [name]);
      categoryIds[name] = res.rows[0].id;
    }

    const adminHash = await bcrypt.hash('admin', 10);
    const userHash = await bcrypt.hash('user', 10);
    const adminRes = await client.query("INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id", ['admin', 'admin@shop.com', adminHash, 'admin']);
    const customerRes = await client.query("INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id", ['user', 'user@shop.com', userHash, 'customer']);

    await client.query("INSERT INTO carts (user_id) VALUES ($1), ($2)", [adminRes.rows[0].id, customerRes.rows[0].id]);

    logger.info("Injecting 26 premium products...");
    const products = [
      // BACKPACKS
      ['Urban Explorer', 'Water-resistant, everyday carry.', 120.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', categoryIds['Backpacks']],
      ['Vanguard Rucksack', 'Heavy duty canvas for the wild.', 145.00, 'https://images.unsplash.com/photo-1547949003-9792a18a2601', categoryIds['Backpacks']],
      ['Nova Daypack', 'Lightweight mesh and nylon hybrid.', 89.00, 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa', categoryIds['Backpacks']],
      ['Apex Commuter', 'Internal laptop sleeve and tech pocket.', 110.00, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3', categoryIds['Backpacks']],
      ['Stealth Rolltop', 'Full waterproof protection.', 160.00, 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7', categoryIds['Backpacks']],
      
      // TOTES
      ['Minimalist Tote', 'Sleek design for office wear.', 85.00, 'https://images.unsplash.com/photo-1591561954557-26941169b49e', categoryIds['Totes']],
      ['Canvas Gallery Tote', 'Eco-friendly reinforced canvas.', 45.00, 'https://images.unsplash.com/photo-1544816155-12df9643f363', categoryIds['Totes']],
      ['Metro Leather Tote', 'Premium full-grain leather.', 210.00, 'https://images.unsplash.com/photo-1575032617751-6ddec2089882', categoryIds['Totes']],
      ['Horizon Weekender', 'Extra large capacity for stays.', 130.00, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', categoryIds['Totes']],
      ['Studio Shopper', 'Foldable premium nylon.', 35.00, 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6', categoryIds['Totes']],

      // SLINGS & MESSENGERS
      ['Tech Sling Bag', 'Compact and secure for gadgets.', 65.00, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3', categoryIds['Slings']],
      ['Midnight Messenger', 'Classic flap-over satchel.', 95.00, 'https://images.unsplash.com/photo-1544816155-12df9643f363', categoryIds['Slings']],
      ['Tactical Crossbody', 'MOLLE compatible attachment points.', 75.00, 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c', categoryIds['Slings']],
      ['City Crossbody', 'Anti-theft hidden zippers.', 55.00, 'https://images.unsplash.com/photo-1524498250077-390f9e378fc0', categoryIds['Slings']],

      // ACCESSORIES
      ['Leather Card Holder', 'Hand-stitched Italian leather.', 45.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93', categoryIds['Accessories']],
      ['Passport Folio', 'Travel documents organized.', 60.00, 'https://images.unsplash.com/photo-1543157145-f78c636d023d', categoryIds['Accessories']],
      ['Cord Organizer', 'Elastic loops for tech cords.', 25.00, 'https://images.unsplash.com/photo-1616423641454-ab0539665f57', categoryIds['Accessories']],
      ['Watch Roll', 'Travel protection for 3 timepieces.', 80.00, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49', categoryIds['Accessories']],
      ['Key Carabiner', 'Solid brass hardware.', 20.00, 'https://images.unsplash.com/photo-1582142839970-2b997ecb2b7a', categoryIds['Accessories']],

      // TRAVEL
      ['Nomad Duffel', 'The ultimate 45L travel bag.', 190.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', categoryIds['Travel']],
      ['Globetrotter Case', 'Hard-shell protection.', 250.00, 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87', categoryIds['Travel']],
      ['Transit Briefcase', 'Professional flight ready.', 140.00, 'https://images.unsplash.com/photo-1544816155-12df9643f363', categoryIds['Travel']],
      
      // LIMITED
      ['Obsidian Series', 'Matte black hardware exclusive.', 300.00, 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa', categoryIds['Limited']],
      ['Marble Print Sling', 'Unique print, no two are alike.', 120.00, 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6', categoryIds['Limited']],
      ['Desert Suede Duffel', 'Soft suede leather luxury.', 280.00, 'https://images.unsplash.com/photo-1544816155-12df9643f363', categoryIds['Limited']],
      ['Arctic Shell Pack', 'Cold weather survival gear.', 220.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', categoryIds['Limited']]
    ];

    for (let p of products) {
      await client.query(
        "INSERT INTO products (name, description, price, image_url, category_id) VALUES ($1, $2, $3, $4, $5)",
        [p[0], p[1], p[2], p[3], p[4]]
      );
    }

    const blogRes = await client.query(`
      INSERT INTO blogs (title, content, likes) VALUES 
      ('The Art of Minimalism', 'In this edition, we explore why less is more in modern carry...', 12),
      ('Summer Travel Guide', 'Your essentials for the upcoming season of exploration.', 34)
      RETURNING id
    `);
    
    await client.query("INSERT INTO blog_comments (blog_id, user_id, text) VALUES ($1, $2, $3)", [blogRes.rows[0].id, customerRes.rows[0].id, 'Inspirational read!']);

    await client.query('COMMIT');
    logger.info("Database seeded with 26 products across 6 categories.");
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error("Seed failed", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();