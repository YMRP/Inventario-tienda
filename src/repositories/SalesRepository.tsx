import { executeTransaction, getAll, getOne } from '@/database/db';
import { getCurrentDateTime } from '@/utils/date';

export async function createSale(
  userId: number,
  items: { variantId: number; quantity: number; unitPrice: number }[]
) {
  let total = 0;

  for (const item of items) {
    total += item.quantity * item.unitPrice;
  }

  let saleId = 0;
  const createdAt = getCurrentDateTime();

  await executeTransaction(async (db) => {
    // Crear venta
    const saleResult = await db.runAsync(
      `
      INSERT INTO sales
(
  user_id,
  total,
  created_at
)
VALUES (?, ?, ?)
      `,
      [userId, total, createdAt]
    );

    saleId = saleResult.lastInsertRowId;
    const sale = await db.getFirstAsync(
  `
  SELECT created_at
  FROM sales
  WHERE id = ?
  `,
  [saleId]
);

console.log('createdAt enviado:', createdAt);
console.log('Registro guardado:', sale);
    console.log('createdAt enviado:', createdAt);

    // Insertar artículos
    for (const item of items) {
      const subtotal = item.quantity * item.unitPrice;

      await db.runAsync(
        `
        INSERT INTO sale_items
        (
          sale_id,
          variant_id,
          quantity,
          unit_price,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [saleId, item.variantId, item.quantity, item.unitPrice, subtotal]
      );

      // Descontar inventario
      // Descontar inventario únicamente si existe suficiente stock
      const result = await db.runAsync(
        `
  UPDATE product_variants
  SET available_stock = available_stock - ?
  WHERE
      id = ?
  AND available_stock >= ?
  `,
        [item.quantity, item.variantId, item.quantity]
      );

      if (result.changes === 0) {
        throw new Error('Stock insuficiente');
      }

      // Registrar movimiento
      await db.runAsync(
        `
      INSERT INTO inventory_movements
(
  variant_id,
  movement_type,
  quantity,
  notes,
  user_id,
  created_at
)
VALUES
(?, 'SALE', ?, 'Venta', ?, ?)
        `,
        [item.variantId, item.quantity, userId, createdAt]
      );
    }
  });

  return saleId;
}

export async function getSalesTotalByDate(date?: string) {
  return await getOne<{ total: number; count: number }>(
    `
    SELECT
      COALESCE(SUM(total), 0) AS total,
      COUNT(*) AS count
    FROM sales
    WHERE (? IS NULL OR DATE(created_at) = DATE(?))
    `,
    [date ?? null, date ?? null]
  );
}

export async function getSalesHistory(date?: string) {
  console.log('Hora del dispositivo:', getCurrentDateTime());
  return await getAll(
    `
    SELECT
      s.id,
      s.total,
      s.created_at,
      u.full_name AS user_name
    FROM sales s
    LEFT JOIN users u ON u.id = s.user_id
    WHERE (? IS NULL OR DATE(s.created_at) = DATE(?))
    ORDER BY s.created_at DESC
    `,
    [date ?? null, date ?? null]
  );
}

export async function getSaleDetail(saleId: number) {
  return await getAll(
    `
    SELECT
      si.variant_id,
      p.name AS product_name,
      si.quantity,
      si.unit_price,
      si.subtotal,
      c.name AS color,
      sz.name AS size
    FROM sale_items si
    INNER JOIN product_variants v ON v.id = si.variant_id
    INNER JOIN products p ON p.id = v.product_id
    LEFT JOIN colors c ON c.id = v.color_id
    LEFT JOIN sizes sz ON sz.id = v.size_id
    WHERE si.sale_id = ?
    `,
    [saleId]
  );
}

export async function getTopProductsByDate(date?: string) {
  return await getAll(
    `
    SELECT
      p.id,
      p.name,
      SUM(si.quantity) AS total_sold,
      SUM(si.subtotal) AS total_revenue
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants v ON v.id = si.variant_id
    INNER JOIN products p ON p.id = v.product_id
    WHERE (? IS NULL OR DATE(s.created_at) = DATE(?))
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT 5
    `,
    [date ?? null, date ?? null]
  );
}
