import { execute, getAll } from "@/database/db";
import { CatalogItem, Product } from "@/types/types";

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
    [
      name,
      description,
      brandId,
      categoryId,
      salePrice
    ]
  );

  return result.lastInsertRowId;
}