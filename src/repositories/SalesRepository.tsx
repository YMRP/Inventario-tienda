import { execute } from '@/database/db';

export async function createSale(
  userId: number,
  items: {
    variantId: number;
    quantity: number;
    unitPrice: number;
  }[]
) {
  let total = 0;

  // calcular total
  for (const item of items) {
    total += item.quantity * item.unitPrice;
  }

  // 1. crear venta
  const saleResult = await execute(
    `
    INSERT INTO sales (user_id, total)
    VALUES (?, ?)
    `,
    [userId, total]
  );

  const saleId = saleResult.lastInsertRowId;

  // 2. insertar items + actualizar stock
  for (const item of items) {
    const subtotal = item.quantity * item.unitPrice;

    await execute(
      `
      INSERT INTO sale_items
      (sale_id, variant_id, quantity, unit_price, subtotal)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        saleId,
        item.variantId,
        item.quantity,
        item.unitPrice,
        subtotal,
      ]
    );

    // descontar stock
    await execute(
      `
      UPDATE product_variants
      SET available_stock = available_stock - ?
      WHERE id = ?
      `,
      [item.quantity, item.variantId]
    );

    // registrar movimiento
    await execute(
      `
      INSERT INTO inventory_movements
      (variant_id, movement_type, quantity, notes, user_id)
      VALUES (?, 'SALE', ?, 'Venta', ?)
      `,
      [item.variantId, item.quantity, userId]
    );
  }

  return saleId;
}