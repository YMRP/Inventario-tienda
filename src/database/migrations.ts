
/*
  responsabilidad: 
  Crear tablas
  Crear índices
  Crear restricciones
*/
//RECORDAR VISITAR A GEPETO Y COMENZAR CON EL DESARROLLO
export const migrations = [
  `
  PRAGMA foreign_keys = ON;
  `,

  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT NOT NULL UNIQUE,

    full_name TEXT NOT NULL,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL
      CHECK(role IN ('ADMIN', 'STANDARD')),

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,

  `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,

  `
  CREATE TABLE IF NOT EXISTS brand_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,

  `
  CREATE TABLE IF NOT EXISTS colors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,

  `
  CREATE TABLE IF NOT EXISTS sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,

  `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    description TEXT,

    brand_id INTEGER NOT NULL,

    category_id INTEGER NOT NULL,

    sale_price REAL NOT NULL,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (brand_id)
      REFERENCES brand_catalog(id),

    FOREIGN KEY (category_id)
      REFERENCES categories(id)
  );
  `,

  `
    CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id INTEGER NOT NULL,

    color_id INTEGER NOT NULL,

    size_id INTEGER NOT NULL,

    barcode TEXT NOT NULL UNIQUE,

    available_stock INTEGER NOT NULL DEFAULT 0
      CHECK(available_stock >= 0),

    reserved_stock INTEGER NOT NULL DEFAULT 0
      CHECK(reserved_stock >= 0),

    sold_stock INTEGER NOT NULL DEFAULT 0
      CHECK(sold_stock >= 0),

    minimum_stock INTEGER NOT NULL DEFAULT 0
      CHECK(minimum_stock >= 0),

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
      REFERENCES products(id),

    FOREIGN KEY (color_id)
      REFERENCES colors(id),

    FOREIGN KEY (size_id)
      REFERENCES sizes(id),

    UNIQUE (
      product_id,
      color_id,
      size_id
    )
  );

,

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    total REAL NOT NULL
      CHECK(total >= 0),

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
  );

  ,

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sale_id INTEGER NOT NULL,

    variant_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL
      CHECK(quantity > 0),

    unit_price REAL NOT NULL
      CHECK(unit_price >= 0),

    subtotal REAL NOT NULL
      CHECK(subtotal >= 0),

    FOREIGN KEY (sale_id)
      REFERENCES sales(id),

    FOREIGN KEY (variant_id)
      REFERENCES product_variants(id)
  );

  ,

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_name TEXT NOT NULL,

    customer_phone TEXT,

    reservation_total REAL NOT NULL
      CHECK(reservation_total >= 0),

    deposit REAL NOT NULL DEFAULT 0
      CHECK(deposit >= 0),

    remaining_balance REAL NOT NULL DEFAULT 0
      CHECK(remaining_balance >= 0),

    due_date TEXT NOT NULL,

    status TEXT NOT NULL
      CHECK(
        status IN (
          'ACTIVE',
          'COMPLETED',
          'CANCELLED',
          'EXPIRED'
        )
      ),

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP
  );

  ,

  CREATE TABLE IF NOT EXISTS reservation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    reservation_id INTEGER NOT NULL,

    variant_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL
      CHECK(quantity > 0),

    unit_price REAL NOT NULL
      CHECK(unit_price >= 0),

    subtotal REAL NOT NULL
      CHECK(subtotal >= 0),

    FOREIGN KEY (reservation_id)
      REFERENCES reservations(id),

    FOREIGN KEY (variant_id)
      REFERENCES product_variants(id)
  );

  ,

  CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    variant_id INTEGER NOT NULL,

    movement_type TEXT NOT NULL
      CHECK(
        movement_type IN (
          'ENTRY',
          'SALE',
          'RESERVATION',
          'RESERVATION_CANCEL',
          'ADJUSTMENT'
        )
      ),

    quantity INTEGER NOT NULL
      CHECK(quantity > 0),

    notes TEXT,

    user_id INTEGER,

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (variant_id)
      REFERENCES product_variants(id),

    FOREIGN KEY (user_id)
      REFERENCES users(id)
  );

  ,

  CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category_id);
  `
  ,
  `
  CREATE INDEX IF NOT EXISTS idx_products_brand
  ON products(brand_id);
  `
  ,
  `
  CREATE INDEX IF NOT EXISTS idx_variant_barcode
  ON product_variants(barcode);
  `
  ,
  `
  CREATE INDEX IF NOT EXISTS idx_sales_date
  ON sales(created_at);
  `
  ,
  `
  CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations(status);





  
  `
];

/*
users
categories
brand_catalog
colors
sizes
products
product_variants
sales
sale_items
reservations
reservation_items
inventory_movements
5 índices
*/