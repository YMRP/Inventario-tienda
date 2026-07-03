import { getAll, getOne } from '@/database/db';

/**
 * Producto más vendido (por cantidad)
 */
export async function getTopSellingProduct() {
  return await getOne(
    `
    SELECT
      p.id,
      p.name,
      SUM(si.quantity) AS total_sold
    FROM sale_items si
    INNER JOIN product_variants v ON v.id = si.variant_id
    INNER JOIN products p ON p.id = v.product_id
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT 1
    `
  );
}

/**
 * Producto menos vendido (que sí haya tenido ventas)
 */
export async function getLeastSellingProduct() {
  return await getOne(
    `
    SELECT
      p.id,
      p.name,
      SUM(si.quantity) AS total_sold
    FROM sale_items si
    INNER JOIN product_variants v ON v.id = si.variant_id
    INNER JOIN products p ON p.id = v.product_id
    GROUP BY p.id, p.name
    ORDER BY total_sold ASC
    LIMIT 1
    `
  );
}

/**
 * Top 5 productos más vendidos
 */
export async function getTopProducts(limit = 5) {
  return await getAll(
    `
    SELECT
      p.id,
      p.name,
      SUM(si.quantity) AS total_sold,
      SUM(si.subtotal) AS total_revenue
    FROM sale_items si
    INNER JOIN product_variants v ON v.id = si.variant_id
    INNER JOIN products p ON p.id = v.product_id
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT ?
    `,
    [limit]
  );
}