import { execute, getAll, getOne } from '@/database/db';
import { CatalogItem, ProductDetail, InventoryProduct, OutOfStockVariant } from '@/types/types';
import { getCurrentDateTime } from '@/utils/date';
import { executeTransaction } from '@/database/db';
/**
 * Obtiene todas las categorías activas.
 */
export async function getAllCategories(): Promise<CatalogItem[]> {
  return await getAll(
    `
   SELECT
    id,
    name,
    variant_template_id,
    active
FROM categories
WHERE active = 1
ORDER BY name
    `
  );
}

/**
 * Obtiene todas las marcas activas.
 */
export async function getAllBrands(): Promise<CatalogItem[]> {
  return await getAll(
    `
    SELECT
    id,
    name,
    active
FROM brand_catalog
WHERE active = 1
ORDER BY name
    `
  );
}

/**
 * Inserta un nuevo producto.
 */
export async function createProduct(
  name: string,
  description: string,
  brandId: number,
  categoryId: number,
  salePrice: number
): Promise<number> {
  const result = await execute(
    `
    INSERT INTO products
    (
      name,
      description,
      brand_id,
      category_id,
      sale_price
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [name, description, brandId, categoryId, salePrice]
  );

  return result.lastInsertRowId;
}

/**
 * Obtiene todos los productos para consulta de inventario.
 */
export async function getInventoryProducts(
  filter: 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'ALL'
): Promise<InventoryProduct[]> {
  let whereClause = `
WHERE p.active = 1
`;

  if (filter === 'LOW_STOCK') {
    whereClause += `
  AND EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND pv.available_stock <= pv.minimum_stock
      AND pv.available_stock > 0
  )
  `;
  }

  if (filter === 'OUT_OF_STOCK') {
    whereClause += `
  AND EXISTS (
    SELECT 1
    FROM product_variants pv
    WHERE pv.product_id = p.id
      AND pv.available_stock = 0
  )
  `;
  }

  return await getAll(
    `
    SELECT

      p.id,
      p.name,

      b.name AS brand,

      c.name AS category,

      p.sale_price,

      COALESCE(
        SUM(v.available_stock),
        0
      ) AS total_stock,

      COUNT(v.id) AS variants

    FROM products p

    INNER JOIN brand_catalog b
      ON b.id = p.brand_id

    INNER JOIN categories c
      ON c.id = p.category_id

    LEFT JOIN product_variants v
      ON v.product_id = p.id

    ${whereClause}
    
    GROUP BY
      p.id,
      p.name,
      b.name,
      c.name,
      p.sale_price

    ORDER BY
      p.name
    `
  );
}

/**
 * Obtiene la información principal de un producto.
 */
export async function getProductDetail(productId: number): Promise<ProductDetail | null> {
  return await getOne(
    `
    SELECT

      p.id,

      p.name,

      p.description,

      p.brand_id,

      p.category_id,

      b.name AS brand,

      c.name AS category,

      p.sale_price

    FROM products p

    INNER JOIN brand_catalog b
      ON b.id = p.brand_id

    INNER JOIN categories c
      ON c.id = p.category_id

    WHERE p.id = ?
    `,
    [productId]
  );
}

/**
 * Actualiza un producto.
 */
export async function updateProduct(
  productId: number,
  name: string,
  description: string,
  brandId: number,
  categoryId: number,
  salePrice: number
): Promise<void> {
  const updatedAt = getCurrentDateTime();

  await execute(
    `
    UPDATE products
    SET
      name = ?,
      description = ?,
      brand_id = ?,
      category_id = ?,
      sale_price = ?,
      updated_at = ?
    WHERE id = ?
    `,
    [name, description, brandId, categoryId, salePrice, updatedAt, productId]
  );
}

/**
 * Crea una categoría.
 */
export async function createCategory(name: string, templateId: number): Promise<void> {
  await execute(
    `
    INSERT INTO categories
    (
      name,
      variant_template_id
    )
    VALUES (?, ?)
    `,
    [name, templateId]
  );
}

/**
 * Crea una marca.
 */
export async function createBrand(name: string): Promise<void> {
  await execute(
    `
    INSERT INTO brand_catalog
    (
      name
    )
    VALUES (?)
    `,
    [name]
  );
}

/**
 * Actualiza una categoría.
 */
export async function updateCategory(id: number, name: string): Promise<void> {
  await execute(
    `
    UPDATE categories
    SET
      name = ?
    WHERE id = ?
    `,
    [name, id]
  );
}
/**
 * Cambia el estado de una categoría.
 */
export async function setCategoryStatus(id: number, active: number): Promise<void> {
  await execute(
    `
    UPDATE categories
    SET active = ?
    WHERE id = ?
    `,
    [active, id]
  );
}

/**
 * Actualiza una marca.
 */
export async function updateBrand(id: number, name: string): Promise<void> {
  await execute(
    `
    UPDATE brand_catalog
    SET name = ?
    WHERE id = ?
    `,
    [name, id]
  );
}

/**
 * Activa o desactiva una marca.
 */
export async function setBrandStatus(id: number, active: number): Promise<void> {
  await execute(
    `
    UPDATE brand_catalog
    SET active = ?
    WHERE id = ?
    `,
    [active, id]
  );
}

export async function categoryHasProducts(categoryId: number): Promise<boolean> {
  const result = await getOne<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM products
    WHERE category_id = ?
    `,
    [categoryId]
  );

  return (result?.total ?? 0) > 0;
}

export async function brandHasProducts(brandId: number): Promise<boolean> {
  const result = await getOne<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM products
    WHERE brand_id = ?
    `,
    [brandId]
  );

  return (result?.total ?? 0) > 0;
}

export async function getOutOfStockVariants(): Promise<OutOfStockVariant[]> {
  return await getAll(
    `
    SELECT

    p.id,

    pv.id AS variant_id,

    p.name,

    b.name AS brand,

    c.name AS category,

    co.name AS color,

    s.name AS size,

    pv.barcode,

    p.sale_price,

    pv.available_stock AS total_stock,

    1 AS variants,

    pv.available_stock,

    pv.minimum_stock

    FROM product_variants pv

    INNER JOIN products p
      ON p.id = pv.product_id

    INNER JOIN brand_catalog b
      ON b.id = p.brand_id

    INNER JOIN categories c
      ON c.id = p.category_id

    INNER JOIN colors co
      ON co.id = pv.color_id

    INNER JOIN sizes s
      ON s.id = pv.size_id

    WHERE

      p.active = 1

      AND pv.active = 1

      AND pv.available_stock = 0

    ORDER BY

      p.name,
      co.name,
      s.name
    `
  );
}

export async function restockVariant(
  variantId: number,
  quantity: number,
  notes: string,
  userId: number
) {
  await executeTransaction(async (db) => {
    await db.runAsync(
      `
      UPDATE product_variants
      SET
        available_stock = available_stock + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [quantity, variantId]
    );

    await db.runAsync(
      `
      INSERT INTO inventory_movements (

        variant_id,
        movement_type,
        quantity,
        notes,
        user_id

      )

      VALUES (

        ?,
        'ENTRY',
        ?,
        ?,
        ?

      )
      `,
      [variantId, quantity, notes.trim() === '' ? null : notes, userId]
    );
  });
}
