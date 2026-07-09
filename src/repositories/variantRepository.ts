import { getAll, getOne, execute } from '@/database/db';
import { CatalogItem, VariantBarcodeResult } from '@/types/types';
import { getCurrentUser } from '@/auth/auth';
import { ProductVariantDetail } from '@/types/types';
import { getCurrentDateTime } from '@/utils/date';
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
export async function getSizesByCategory(categoryId: number): Promise<CatalogItem[]> {
  return await getAll<CatalogItem>(
    `
    SELECT
      s.id,
      s.name
    FROM sizes s

    INNER JOIN categories c
      ON c.variant_template_id = s.template_id

    WHERE
      c.id = ?
      AND s.active = 1

    ORDER BY s.id
    `,
    [categoryId]
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
  let code12 = '';

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
  const createdAt = getCurrentDateTime();

  await execute(
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
    VALUES (?, 'ENTRY', ?, ?, ?, ?)
    `,
    [variantId, quantity, 'Stock inicial', userId, createdAt]
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
  v.available_stock,
  v.reserved_stock,
  p.name AS product_name,
  p.sale_price
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE v.barcode = ?
    `,
    [barcode]
  );
}

/**
 * Obtiene la plantilla de variantes asociada a una categoría.
 */
export async function getTemplateByCategory(categoryId: number): Promise<number | null> {
  const result = await getOne<{ variant_template_id: number }>(
    `
    SELECT variant_template_id
    FROM categories
    WHERE id = ?
    `,
    [categoryId]
  );

  return result?.variant_template_id ?? null;
}

/**
 * Obtiene las tallas de una plantilla.
 */
export async function getSizesByTemplate(templateId: number): Promise<CatalogItem[]> {
  return await getAll(
    `
    SELECT
    id,
    name,
    active
FROM sizes
WHERE
    template_id = ?
ORDER BY id
    `,
    [templateId]
  );
}

/**
 * Obtiene todas las plantillas activas.
 */
export async function getVariantTemplates(): Promise<CatalogItem[]> {
  return await getAll(
    `
    SELECT
    id,
    name,
    active
FROM variant_templates
ORDER BY name
    `
  );
}

/**
 * Obtiene las tallas de una plantilla.
 */

/**
 * Obtiene todos los colores.
 */
export async function getCatalogColors(): Promise<CatalogItem[]> {
  return await getAll(
    `
   SELECT
    id,
    name,
    active
FROM colors WHERE active = 1
ORDER BY name
    `
  );
}

/**
 * Crea un color.
 */
export async function createColor(name: string): Promise<void> {
  await execute(
    `
    INSERT INTO colors
    (
      name
    )
    VALUES (?)
    `,
    [name]
  );
}

/**
 * Crea una talla.
 */
export async function createSize(templateId: number, name: string): Promise<void> {
  await execute(
    `
    INSERT INTO sizes
    (
      template_id,
      name
    )
    VALUES (?, ?)
    `,
    [templateId, name]
  );
}
/**
 * Crea una plantilla de variantes.
 */
export async function createVariantTemplate(name: string): Promise<void> {
  await execute(
    `
    INSERT INTO variant_templates
    (
      name
    )
    VALUES (?)
    `,
    [name]
  );
}

export async function updateColor(id: number, name: string) {
  await execute(
    `
    UPDATE colors
    SET name=?
    WHERE id=?
    `,
    [name, id]
  );
}

export async function setColorStatus(id: number, active: number) {
  await execute(
    `
    UPDATE colors
    SET active=?
    WHERE id=?
    `,
    [active, id]
  );
}

export async function updateSize(id: number, templateId: number, name: string) {
  await execute(
    `
    UPDATE sizes
    SET
      template_id=?,
      name=?
    WHERE id=?
    `,
    [templateId, name, id]
  );
}

export async function setSizeStatus(id: number, active: number) {
  await execute(
    `
    UPDATE sizes
    SET active=?
    WHERE id=?
    `,
    [active, id]
  );
}

export async function updateVariantTemplate(id: number, name: string) {
  await execute(
    `
    UPDATE variant_templates
    SET name=?
    WHERE id=?
    `,
    [name, id]
  );
}

export async function setVariantTemplateStatus(id: number, active: number) {
  await execute(
    `
    UPDATE variant_templates
    SET active=?
    WHERE id=?
    `,
    [active, id]
  );
}

export async function colorHasVariants(
  colorId: number
): Promise<boolean> {

  const result = await getOne<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM product_variants
    WHERE color_id = ?
    `,
    [colorId]
  );

  return (result?.total ?? 0) > 0;
}

export async function sizeHasVariants(
  sizeId: number
): Promise<boolean> {

  const result = await getOne<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM product_variants
    WHERE size_id = ?
    `,
    [sizeId]
  );

  return (result?.total ?? 0) > 0;
}

export async function templateHasCategories(
  templateId: number
): Promise<boolean> {

  const result = await getOne<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM categories
    WHERE variant_template_id = ?
    `,
    [templateId]
  );

  return (result?.total ?? 0) > 0;
}