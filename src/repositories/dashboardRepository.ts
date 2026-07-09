import { getOne } from '@/database/db';
import { DashboardStats } from '@/types/types';
/**
 * Obtiene todas las estadísticas del Dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    todaySalesResult,
    productsResult,
    variantsResult,
    lowStockResult,
    outOfStockResult,
  ] = await Promise.all([
    // 💰 Ventas de hoy
    getOne<{ total: number }>(
      `
      SELECT
        COALESCE(SUM(total), 0) AS total
      FROM sales
      WHERE DATE(created_at) = DATE('now')
      `
    ),

    // 📦 Productos activos
    getOne<{ total: number }>(
      `
      SELECT COUNT(*) AS total
      FROM products
      WHERE active = 1
      `
    ),

    // 👕 Variantes totales
    getOne<{ total: number }>(
      `
      SELECT COUNT(*) AS total
      FROM product_variants
      `
    ),

    // ⚠️ Stock bajo
    getOne<{ total: number }>(
      `
      SELECT COUNT(*) AS total
      FROM product_variants
      WHERE available_stock <= minimum_stock
        AND available_stock > 0
      `
    ),

    // ❌ Sin stock
    getOne<{ total: number }>(
      `
      SELECT COUNT(*) AS total
      FROM product_variants
      WHERE available_stock = 0
      `
    ),
  ]);

  return {
    todaySales: todaySalesResult?.total ?? 0,
    products: productsResult?.total ?? 0,
    variants: variantsResult?.total ?? 0,
    lowStock: lowStockResult?.total ?? 0,
    outOfStock: outOfStockResult?.total ?? 0,
  };
}