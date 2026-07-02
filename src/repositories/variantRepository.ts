import { getAll, getOne, execute } from '@/database/db';
import { CatalogItem, VariantBarcodeResult } from '@/types/types';
import { getCurrentUser } from '@/auth/auth';
import { ProductVariantDetail } from '@/types/types';
/**
 * Obtiene todos los colores activos.
 */
export async function getAllColors(): Promise<CatalogItem[]> {
  return await getAll(
    `
    SELECT
      id,
      name
    FROM colors
    WHERE active = 1
    ORDER BY name
    `
  );
}

/**
 * Obtiene todas las tallas activas.
 */
export async function getAllSizes(): Promise<CatalogItem[]> {
  return await getAll(
    `
    SELECT
      id,
      name
    FROM sizes
    WHERE active = 1
    ORDER BY id
    `
  );
}

/**
 * Verifica si un código de barras ya existe.
 */
export async function barcodeExists(barcode: string): Promise<boolean> {
  const result = await getOne<{ id: number }>(
    `
    SELECT id
    FROM product_variants
    WHERE barcode = ?
    `,
    [barcode]
  );

  return result !== null;
}

/**
 * Calcula el dígito verificador de un EAN-13.
 */
function calculateEAN13CheckDigit(code12: string): string {
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    const digit = Number(code12[i]);

    if (i % 2 === 0) {
      sum += digit;
    } else {
      sum += digit * 3;
    }
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit.toString();
}

/**
 * Genera un código EAN-13 válido.
 */
function generateBarcode(): string {
  let code12 = "";

  for (let i = 0; i < 12; i++) {
    code12 += Math.floor(Math.random() * 10);
  }

  return code12 + calculateEAN13CheckDigit(code12);
}

/**
 * Genera un código de barras que no exista.
 */
export async function generateUniqueBarcode(): Promise<string> {
  while (true) {
    const barcode = generateBarcode();
    const exists = await barcodeExists(barcode);
    if (!exists) {
      return barcode;
    }
  }
}

/**
 * Inserta una variante.
/**
 * Inserta una variante y devuelve su ID.
 */
export async function createVariant(
  productId: number,
  colorId: number,
  sizeId: number,
  barcode: string,
  availableStock: number,
  minimumStock: number
): Promise<number> {
  const result = await execute(
    `
    INSERT INTO product_variants
    (
      product_id,
      color_id,
      size_id,
      barcode,
      available_stock,
      minimum_stock
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [productId, colorId, sizeId, barcode, availableStock, minimumStock]
  );

  return result.lastInsertRowId;
}

/**
 * Registra un movimiento de inventario.
 */
/**
 * Registra un movimiento de inventario.
 */
export async function registerInventoryMovement(
  variantId: number,
  quantity: number,
  userId: number
): Promise<void> {
  await execute(
    `
    INSERT INTO inventory_movements
    (
      variant_id,
      movement_type,
      quantity,
      notes,
      user_id
    )
    VALUES (?, 'ENTRY', ?, ?, ?)
    `,
    [variantId, quantity, 'Stock inicial', userId]
  );
}

/**
 * Obtiene todas las variantes de un producto.
 */
export async function getVariantsByProduct(productId: number): Promise<ProductVariantDetail[]> {
  return await getAll(
    `
    SELECT

      pv.id,

      colors.name AS color,

      sizes.name AS size,

      pv.barcode,

      pv.available_stock,

      pv.minimum_stock

    FROM product_variants pv

    INNER JOIN colors
      ON colors.id = pv.color_id

    INNER JOIN sizes
      ON sizes.id = pv.size_id

    WHERE pv.product_id = ?

    ORDER BY
      colors.name,
      sizes.id
    `,
    [productId]
  );
}
export async function getVariantByBarcode(barcode: string): Promise<VariantBarcodeResult | null> {
  return await getOne<VariantBarcodeResult>(
    `
    SELECT
  v.id,
  v.product_id,
  v.barcode,
  p.name AS product_name,
  p.sale_price
FROM product_variants v
INNER JOIN products p ON p.id = v.product_id
WHERE v.barcode = ?
    `,
    [barcode]
  );
}
