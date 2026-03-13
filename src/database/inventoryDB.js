/**
 * SQLite database for bar inventory.
 * Tables: products, categories, inventory_sessions, inventory_items.
 */
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

const DB_NAME = 'inventory.db';

let db = null;
let initPromise = null;

/**
 * Initialize and open the database; create tables if they don't exist.
 */
export async function initDB() {
  if (db) return db;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      db = await SQLite.openDatabase({ name: DB_NAME, location: 'default' });
      await createTables();
      return db;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();
  return initPromise;
}

async function createTables() {
  const sql = [
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      volume INTEGER,
      image TEXT,
      subCategory TEXT,
      price REAL DEFAULT 0,
      fillLevel INTEGER DEFAULT 100,
      createdAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      categoryName TEXT,
      date TEXT,
      team TEXT,
      createdAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      fullBottles INTEGER DEFAULT 0,
      fillLevel INTEGER DEFAULT 100,
      FOREIGN KEY (sessionId) REFERENCES inventory_sessions(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,
  ];
  for (const s of sql) {
    await db.executeSql(s);
  }
  // Ensure default category exists
  await db.executeSql(
    `INSERT OR IGNORE INTO categories (id, name, createdAt) VALUES (1, 'Cocktailstation', datetime('now'))`
  );
  await seedDummyData();
}

/** Seed categories, products, and sessions. */
async function seedDummyData() {
  if (!db) return;
  const raw = (sql, params = []) =>
    db.executeSql(sql, params).then(([r]) => ({ rows: r.rows.raw() }));

  try {
    const { rows: catRows } = await raw('SELECT COUNT(*) as c FROM categories');
    const catCount = catRows[0]?.c ?? 0;
    if (catCount < 4) {
      const cats = [['Küche'], ['Lager'], ['Regal links'], ['Regal rechts']];
      for (const [name] of cats) {
        await db.executeSql(
          'INSERT OR IGNORE INTO categories (name, createdAt) VALUES (?, datetime("now"))',
          [name]
        );
      }
    }

    const { rows: productRows } = await raw('SELECT COUNT(*) as c FROM products');
    if ((productRows[0]?.c ?? 0) === 0) {
      const products = [
        { name: 'Aperol Aperitivo Italiano', volume: 700, price: 12.5, fillLevel: 85, image: 'https://images.unsplash.com/photo-1641475910579-d4d2fb3034d7?w=300&fit=crop' },
        { name: 'Campari', volume: 700, price: 14.0, fillLevel: 60, image: 'https://images.unsplash.com/photo-1728416772991-b66fe62ab72f?w=300&fit=crop' },
        { name: 'Heineken', volume: 330, price: 0.85, fillLevel: 100, image: 'https://images.unsplash.com/photo-1627483830384-2f8ed6f2c394?w=300&fit=crop' },
        { name: 'Red Bull', volume: 355, price: 1.2, fillLevel: 90, image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&fit=crop' },
        { name: 'Belsazar Red', volume: 750, price: 18.0, fillLevel: 45, image: 'https://images.unsplash.com/photo-1754926106329-71aac779f440?w=300&fit=crop' },
        { name: 'Sierra Milenario Reposado', volume: 700, price: 22.0, fillLevel: 70, image: 'https://images.unsplash.com/photo-1754926106329-71aac779f440?w=300&fit=crop' },
        { name: 'Bacardi 8 y', volume: 700, price: 16.0, fillLevel: 20, image: 'https://images.unsplash.com/photo-1754926106329-71aac779f440?w=300&fit=crop' },
        { name: 'Botran 18 Anejo Rum', volume: 700, price: 28.0, fillLevel: 100, image: 'https://images.unsplash.com/photo-1754926106329-71aac779f440?w=300&fit=crop' },
        { name: 'Angostura Premium Rum', volume: 1000, price: 24.0, fillLevel: 55, image: 'https://images.unsplash.com/photo-1754926106329-71aac779f440?w=300&fit=crop' },
      ];
      for (const p of products) {
        await db.executeSql(
          `INSERT INTO products (categoryId, name, volume, image, subCategory, price, fillLevel, createdAt)
           VALUES (1, ?, ?, ?, 'Spirits', ?, ?, datetime('now'))`,
          [p.name, p.volume, p.image || '', p.price ?? 0, p.fillLevel ?? 100]
        );
      }
    }

    const { rows: sessionRows } = await raw('SELECT COUNT(*) as c FROM inventory_sessions');
    if ((sessionRows[0]?.c ?? 0) === 0) {
      await db.executeSql(
        `INSERT INTO inventory_sessions (categoryId, categoryName, date, team, createdAt)
         VALUES (1, 'Cocktailstation', date('now'), 'Team A', datetime('now'))`
      );
      await db.executeSql(
        `INSERT INTO inventory_sessions (categoryId, categoryName, date, team, createdAt)
         VALUES (2, 'Küche', date('now', '-1 day'), 'Team B', datetime('now'))`
      );
      await db.executeSql(
        `INSERT INTO inventory_sessions (categoryId, categoryName, date, team, createdAt)
         VALUES (3, 'Lager', date('now', '-2 days'), 'To', datetime('now'))`
      );
    }
  } catch (err) {
    console.warn('Seed dummy data failed:', err);
  }
}

export async function runSql(sql, params = []) {
  await initDB();
  if (!db) return Promise.reject(new Error('Database not initialized'));
  const [result] = await db.executeSql(sql, params);
  return {
    rows: result.rows.raw(),
    insertId: result.insertId,
    rowsAffected: result.rowsAffected,
  };
}

// --- Categories ---
export async function getCategories() {
  const { rows } = await runSql('SELECT * FROM categories ORDER BY name');
  return rows;
}

export async function addCategory(name) {
  await runSql('INSERT INTO categories (name, createdAt) VALUES (?, datetime("now"))', [name]);
  const { rows } = await runSql('SELECT last_insert_rowid() as id');
  return rows[0]?.id;
}

export async function updateCategory(id, name) {
  await runSql('UPDATE categories SET name = ? WHERE id = ?', [name || '', id]);
}

export async function deleteCategory(id) {
  if (!id) return;
  await runSql('DELETE FROM products WHERE categoryId = ?', [id]);
  await runSql('DELETE FROM categories WHERE id = ?', [id]);
}

// --- Products ---
export async function getProducts(categoryId = null) {
  const sql = categoryId
    ? 'SELECT * FROM products WHERE categoryId = ? ORDER BY name'
    : 'SELECT * FROM products ORDER BY name';
  const params = categoryId ? [categoryId] : [];
  const { rows } = await runSql(sql, params);
  return rows;
}

export async function getProductById(id) {
  const { rows } = await runSql('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function addProduct(product) {
  const { name, volume, image, subCategory, price, fillLevel, categoryId = 1 } = product;
  await runSql(
    `INSERT INTO products (categoryId, name, volume, image, subCategory, price, fillLevel, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [categoryId, name || '', volume || 0, image || '', subCategory || '', Number(price) || 0, Number(fillLevel) ?? 100]
  );
  const { rows } = await runSql('SELECT last_insert_rowid() as id');
  return rows[0]?.id;
}

export async function addProducts(products, categoryId = 1) {
  for (const p of products) {
    await addProduct({ ...p, categoryId });
  }
}

export async function updateProduct(id, updates) {
  const allowed = ['name', 'volume', 'image', 'subCategory', 'price', 'fillLevel', 'categoryId'];
  const setClause = allowed.filter((k) => updates[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const values = allowed.filter((k) => updates[k] !== undefined).map((k) => updates[k]);
  if (values.length === 0) return;
  await runSql(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function updateProductFillLevel(id, fillLevel) {
  await runSql('UPDATE products SET fillLevel = ? WHERE id = ?', [Math.round(fillLevel), id]);
}

export async function updateProductPrice(id, price) {
  await runSql('UPDATE products SET price = ? WHERE id = ?', [price, id]);
}

export async function deleteProduct(id) {
  await runSql('DELETE FROM products WHERE id = ?', [id]);
}

export async function searchProducts(query, categoryId = null) {
  const sql = categoryId
    ? 'SELECT * FROM products WHERE categoryId = ? AND name LIKE ? ORDER BY name'
    : 'SELECT * FROM products WHERE name LIKE ? ORDER BY name';
  const like = `%${(query || '').trim()}%`;
  const params = categoryId ? [categoryId, like] : [like];
  const { rows } = await runSql(sql, params);
  return rows;
}

// --- Inventory sessions & reports ---
export async function createInventorySession(categoryId, categoryName, team = '') {
  await runSql(
    `INSERT INTO inventory_sessions (categoryId, categoryName, date, team, createdAt)
     VALUES (?, ?, date('now'), ?, datetime('now'))`,
    [categoryId, categoryName || '', team]
  );
  const { rows } = await runSql('SELECT last_insert_rowid() as id');
  return rows[0]?.id;
}

export async function getInventorySessions(limit = 50) {
  const { rows } = await runSql(
    `SELECT * FROM inventory_sessions ORDER BY createdAt DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function getProductsWithFillLevels(categoryId) {
  const { rows } = await runSql(
    'SELECT id, name, volume, image, fillLevel, price FROM products WHERE categoryId = ? ORDER BY name',
    [categoryId]
  );
  return rows;
}

/**
 * Get report stats: total bottles, total value, low stock count.
 */
export async function getReportStats(categoryId = null) {
  const where = categoryId ? ' WHERE categoryId = ?' : '';
  const params = categoryId ? [categoryId] : [];
  const { rows } = await runSql(`SELECT * FROM products${where}`, params);
  const totalBottles = rows.length;
  const totalValue = rows.reduce((sum, p) => sum + (p.price || 0), 0);
  const lowStock = rows.filter((p) => (p.fillLevel ?? 100) < 25).length;
  return { totalBottles, totalValue, lowStock, products: rows };
}

export { db };
