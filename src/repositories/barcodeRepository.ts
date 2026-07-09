import { getAll } from '@/database/db';
import { BarcodeLabel } from '@/types/types';

export async function getBarcodeLabels(): Promise<BarcodeLabel[]> {
  return await getAll(
    `
    SELECT

      p.name AS product_name,

      c.name AS color,

      s.name AS size,

      pv.barcode

    FROM product_variants pv

    INNER JOIN products p
      ON p.id = pv.product_id

    INNER JOIN colors c
      ON c.id = pv.color_id

    INNER JOIN sizes s
      ON s.id = pv.size_id

    ORDER BY

      p.name,

      c.name,

      s.id
    `
  );
}