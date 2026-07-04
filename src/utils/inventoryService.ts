export function getAvailableToSell(variant: {
  available_stock: number;
  reserved_stock: number;
}) {
  return variant.available_stock - variant.reserved_stock;
}