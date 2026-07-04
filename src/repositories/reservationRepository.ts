import { execute, getAll, getOne, executeTransaction } from '@/database/db';
import { ReservationDetailItem, ReservationProps } from '@/types/types';
import { getCurrentDateTime } from '@/utils/date';

export async function createReservation(
  customerName: string,
  customerPhone: string | null,
  daysToHold: number,
  items: {
    variantId: number;
    quantity: number;
    unitPrice: number;
  }[]
) {
  let total = 0;
  const createdAt = getCurrentDateTime();
  for (const item of items) {
    total += item.quantity * item.unitPrice;
  }

  // 📅 calcular vencimiento
  const expiresDate = new Date();

  expiresDate.setDate(expiresDate.getDate() + daysToHold);

  const expiresAt = `${expiresDate.getFullYear()}-${String(expiresDate.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(expiresDate.getDate()).padStart(2, '0')} ${String(expiresDate.getHours()).padStart(
    2,
    '0'
  )}:${String(expiresDate.getMinutes()).padStart(2, '0')}:${String(
    expiresDate.getSeconds()
  ).padStart(2, '0')}`;
  // 1. crear reservation
  const result = await execute(
    `
    INSERT INTO reservations (
    customer_name,
    customer_phone,
    reservation_total,
    deposit,
    remaining_balance,
    due_date,
    status,
    expires_at,
    created_at
)
VALUES (?, ?, ?, 0, ?, ?, 'ACTIVE', ?, ?)
    `,
    [customerName, customerPhone, total, total, expiresAt, expiresAt, createdAt]
  );

  const reservationId = result.lastInsertRowId;

  // 2. items + stock
  for (const item of items) {
    const subtotal = item.quantity * item.unitPrice;

    // insertar item
    await execute(
      `
      INSERT INTO reservation_items (
        reservation_id,
        variant_id,
        quantity,
        unit_price,
        subtotal
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [reservationId, item.variantId, item.quantity, item.unitPrice, subtotal]
    );

    // 📉 mover stock a reservado
    await execute(
      `
      UPDATE product_variants
      SET available_stock = available_stock - ?,
          reserved_stock = reserved_stock + ?
      WHERE id = ?
      `,
      [item.quantity, item.quantity, item.variantId]
    );
  }

  return reservationId;
}

export async function getReservations() {
  return await getAll(
    `
    SELECT
      r.id,
      r.customer_name,
      r.customer_phone,
      r.reservation_total,
      r.status,
      r.created_at,
      r.expires_at
    FROM reservations r
    ORDER BY r.created_at DESC
    `
  );
}

export async function getReservationDetail(
  reservationId: number
): Promise<ReservationDetailItem[]> {
  return await getAll<ReservationDetailItem>(
    `
    SELECT
      ri.variant_id,

      p.name AS product_name,

      c.name AS color,

      s.name AS size,

      v.barcode,

      ri.quantity,

      ri.unit_price,

      ri.subtotal

    FROM reservation_items ri

    INNER JOIN product_variants v
      ON v.id = ri.variant_id

    INNER JOIN products p
      ON p.id = v.product_id

    INNER JOIN colors c
      ON c.id = v.color_id

    INNER JOIN sizes s
      ON s.id = v.size_id

    WHERE ri.reservation_id = ?

    ORDER BY p.name
    `,
    [reservationId]
  );
}

export async function getAllReservations(): Promise<ReservationProps[]> {
  return await getAll<ReservationProps>(
    `
    SELECT
      id,
      customer_name,
      customer_phone,
      reservation_total,
      status,
      expires_at,
      created_at
    FROM reservations
    ORDER BY created_at DESC
    `
  );
}

export async function getReservationById(reservationId: number) {
  return await getOne<ReservationProps>(
    `
    SELECT
      id,
      customer_name,
      customer_phone,
      reservation_total,
      status,
      expires_at,
      created_at
    FROM reservations
    WHERE id = ?
    `,
    [reservationId]
  );
}

export async function convertReservationToSale(reservationId: number, userId: number) {
  await executeTransaction(async (db) => {
    const createdAt = getCurrentDateTime();
    const items = await db.getAllAsync(
      `
      SELECT *
      FROM reservation_items
      WHERE reservation_id = ?
      `,
      [reservationId]
    );

    let total = 0;

    for (const item of items) {
      total += item.subtotal;
    }

    const saleResult = await db.runAsync(
      `
     INSERT INTO sales (
    user_id,
    total,
    created_at
)
VALUES (?, ?, ?)
      `,
      [userId, total, createdAt]
    );

    const saleId = saleResult.lastInsertRowId;

    for (const item of items) {
      await db.runAsync(
        `
        INSERT INTO sale_items
        (sale_id, variant_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
        `,
        [saleId, item.variant_id, item.quantity, item.unit_price, item.subtotal]
      );

      // liberar reservado y descontar vendido
      await db.runAsync(
        `
        UPDATE product_variants
        SET reserved_stock = reserved_stock - ?,
            sold_stock = sold_stock + ?
        WHERE id = ?
        `,
        [item.quantity, item.quantity, item.variant_id]
      );
    }

    // marcar apartado como completado
    await db.runAsync(
      `
      UPDATE reservations
      SET status = 'COMPLETED'
      WHERE id = ?
      `,
      [reservationId]
    );
  });
}
export async function cancelReservation(reservationId: number) {
  await executeTransaction(async (db) => {
    const reservation = await db.getFirstAsync(
      `
  SELECT status
  FROM reservations
  WHERE id = ?
  `,
      [reservationId]
    );

    if (!reservation || reservation.status !== 'ACTIVE') {
      throw new Error('Este apartado ya no está activo.');
    }
    // Obtener productos del apartado
    const items = (await db.getAllAsync(
      `
      SELECT
        variant_id,
        quantity
      FROM reservation_items
      WHERE reservation_id = ?
      `,
      [reservationId]
    )) as {
      variant_id: number;
      quantity: number;
    }[];

    // Regresar el stock reservado al disponible
    for (const item of items) {
      await db.runAsync(
        `
        UPDATE product_variants
SET
  available_stock = available_stock + ?,
  reserved_stock = reserved_stock - ?
WHERE
  id = ?
  AND reserved_stock >= ?
        `,
        [item.quantity, item.quantity, item.variant_id, item.quantity]
      );
    }

    // Marcar el apartado como cancelado
    await db.runAsync(
      `
      UPDATE reservations
      SET status = 'CANCELLED'
      WHERE id = ?
      `,
      [reservationId]
    );
  });
}
export async function expireReservations() {
  // 1. obtener apartados vencidos
  const now = getCurrentDateTime();

  // 1. obtener apartados vencidos
  const expired = await getAll<{ id: number }>(
    `
  SELECT id
  FROM reservations
  WHERE status = 'ACTIVE'
  AND expires_at < ?
  `,
    [now]
  );

  if (!expired.length) return;

  for (const reservation of expired) {
    const items = await getAll<{
      variant_id: number;
      quantity: number;
    }>(
      `
  SELECT variant_id, quantity
  FROM reservation_items
  WHERE reservation_id = ?
  `,
      [reservation.id]
    );

    // ✔ ahora SÍ es iterable
    for (const item of items) {
      await execute(
        `
    UPDATE product_variants
    SET available_stock = available_stock + ?,
        reserved_stock = reserved_stock - ?
    WHERE id = ?
    `,
        [item.quantity, item.quantity, item.variant_id]
      );
    }

    // 3. marcar como expirado
    await execute(
      `
      UPDATE reservations
      SET status = 'EXPIRED'
      WHERE id = ?
      `,
      [reservation.id]
    );
  }
}
