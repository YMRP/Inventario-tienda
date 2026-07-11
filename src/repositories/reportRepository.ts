import { getAll } from '@/database/db';
import { InventoryMovementReport } from '@/types/types';


export async function getInventoryMovementsReport(date?: string): Promise<InventoryMovementReport[]> {
  let where = '';

  const params: any[] = [];

  if (date) {
    where = `
      WHERE im.created_at LIKE ?
    `;

    params.push(`${date}%`);
  }

  return await getAll<InventoryMovementReport>(
    `
    SELECT
      im.id,
      im.movement_type,
      im.quantity,
      im.notes,
      im.created_at,

      p.name AS product_name,
      c.name AS color,
      s.name AS size,

      u.full_name AS user_name

    FROM inventory_movements im

    INNER JOIN product_variants pv
      ON pv.id = im.variant_id

    INNER JOIN products p
      ON p.id = pv.product_id

    INNER JOIN colors c
      ON c.id = pv.color_id

    INNER JOIN sizes s
      ON s.id = pv.size_id

    LEFT JOIN users u
      ON u.id = im.user_id

    ${where}

    ORDER BY im.created_at DESC
    `,
    params
  );
}