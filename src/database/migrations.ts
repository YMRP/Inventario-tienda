/*
|--------------------------------------------------------------------------
| MIGRATIONS
|--------------------------------------------------------------------------
|
| Responsabilidad:
|
| - Crear tablas
| - Crear índices
| - Definir restricciones
|
| Cada elemento del arreglo representa UNA migración.
| Esto facilita localizar errores cuando alguna migración falle.
|
*/

export const migrations = [
  /*
  |--------------------------------------------------------------------------
  | Activar llaves foráneas
  |--------------------------------------------------------------------------
  */
  `
  PRAGMA foreign_keys = ON;
  `,

  /*
  |--------------------------------------------------------------------------
  | USERS
  |--------------------------------------------------------------------------
  */
  `
  CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT NOT NULL UNIQUE,

    full_name TEXT NOT NULL,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL
      CHECK(role IN ('ADMIN','STANDARD')),

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP

  );
  `,

  /*
  |--------------------------------------------------------------------------
  | CATEGORIES
  |--------------------------------------------------------------------------
  */
  `
  CREATE TABLE IF NOT EXISTS categories (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    variant_template_id INTEGER,

    active INTEGER NOT NULL
      DEFAULT 1
      CHECK(active IN (0,1)),

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (variant_template_id)
      REFERENCES variant_templates(id)

);

 
  `,

  /*
|--------------------------------------------------------------------------
| VARIANT TEMPLATES
|--------------------------------------------------------------------------
*/
  `
CREATE TABLE IF NOT EXISTS variant_templates (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL
    UNIQUE,

  active INTEGER NOT NULL
    DEFAULT 1
    CHECK(active IN (0,1)),

  created_at TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP,

  updated_at TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP

);
`,

  /*
  |--------------------------------------------------------------------------
  | BRAND CATALOG
  |--------------------------------------------------------------------------
  */
  `
  CREATE TABLE IF NOT EXISTS brand_catalog (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP

  );
  `,

  /*
  |--------------------------------------------------------------------------
  | COLORS
  |--------------------------------------------------------------------------
  */
  `
  CREATE TABLE IF NOT EXISTS colors (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP

  );
  `,

  /*
  |--------------------------------------------------------------------------
  | SIZES
  |--------------------------------------------------------------------------
  */
  `
  CREATE TABLE IF NOT EXISTS sizes (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    template_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    active INTEGER NOT NULL
      DEFAULT 1
      CHECK(active IN (0,1)),

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (template_id)
      REFERENCES variant_templates(id),

    UNIQUE(template_id, name)

);

 
  `,
  /*
  |--------------------------------------------------------------------------
  | PRODUCTS
  |--------------------------------------------------------------------------
  */
  `
  CREATE TABLE IF NOT EXISTS products (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    description TEXT,

    brand_id INTEGER NOT NULL,

    category_id INTEGER NOT NULL,

    sale_price REAL NOT NULL
      CHECK(sale_price >= 0),

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (brand_id)
      REFERENCES brand_catalog(id),

    FOREIGN KEY (category_id)
      REFERENCES categories(id)

  );
  `,

  /*
  |--------------------------------------------------------------------------
  | PRODUCT VARIANTS
  |--------------------------------------------------------------------------
  |
  | Cada variante representa una combinación única:
  |
  | Playera Nike
  | Color: Negro
  | Talla: M
  |
  | El stock se controla por variante.
  |--------------------------------------------------------------------------
  */
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

    created_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL
      DEFAULT CURRENT_TIMESTAMP,

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
  `,
  /*
  |--------------------------------------------------------------------------
  | SALES
  |--------------------------------------------------------------------------
  */
  `
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
  `,

  /*
  |--------------------------------------------------------------------------
  | SALE ITEMS
  |--------------------------------------------------------------------------
  */
  `
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
  `,

  /*
  |--------------------------------------------------------------------------
  | RESERVATIONS
  |--------------------------------------------------------------------------
  */
  `
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
  `,

  /*
  |--------------------------------------------------------------------------
  | RESERVATION ITEMS
  |--------------------------------------------------------------------------
  */
  `
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
  `,

  /*
  |--------------------------------------------------------------------------
  | INVENTORY MOVEMENTS
  |--------------------------------------------------------------------------
  |
  | Historial de todos los movimientos del inventario.
  |--------------------------------------------------------------------------
  */
  `
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

  
  `,
  /*
  |--------------------------------------------------------------------------
  | ÍNDICES
  |--------------------------------------------------------------------------
  |
  | Los índices aceleran las búsquedas.
  | No almacenan información nueva.
  | Solamente ayudan a que SQLite encuentre los registros más rápido.
  |
  */

  /*
  | Buscar productos por categoría.
  */
  `
  CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category_id);
  `,

  /*
  | Buscar productos por marca.
  */
  `
  CREATE INDEX IF NOT EXISTS idx_products_brand
  ON products(brand_id);
  `,

  /*
  | Buscar variantes por código de barras.
  */
  `
  CREATE INDEX IF NOT EXISTS idx_variant_barcode
  ON product_variants(barcode);
  `,

  /*
  | Buscar ventas por fecha.
  */
  `
  CREATE INDEX IF NOT EXISTS idx_sales_date
  ON sales(created_at);
  `,

  /*
  | Buscar apartados por estado.
  */
  `
  CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations(status);
  `,
  `
ALTER TABLE reservations
ADD COLUMN expires_at TEXT;
  `,
];
