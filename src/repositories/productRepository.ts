import { execute, getAll, getOne } from '@/database/db';
import { CatalogItem, Product, ProductDetail } from '@/types/types';
import { InventoryProduct } from '@/types/types';

/**
 * Obtiene todas las categorías activas.
 */
export async function getAllCategories(): Promise<CatalogItem[]> {
  return await getAll(
    `
    SELECT
      id,
      name
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
      name
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
  await execute(
    `
    UPDATE products
    SET
      name = ?,
      description = ?,
      brand_id = ?,
      category_id = ?,
      sale_price = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [name, description, brandId, categoryId, salePrice, productId]
  );
}
