/*
ROLES PERMITIDOS
*/

export type UserRole = 'ADMIN' | 'STANDARD';

export type VariantBarcodeResult = {
  id: number;
  product_id: number;
  barcode: string;
  product_name: string;
  color: string;
  size: string;
  sale_price: number;
  available_stock: number;
};

export type User = {
  id: number;
  username: string;
  full_name: string;
  password_hash: string;
  role: UserRole;
  active: number;
  created_at: string;
  updated_at: string;
};

export type CreateUserProps = {
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
};

export type LoginResult = {
  success: boolean;
  user: User | null;
  message: string;
};

export type CartItem = {
  variantId: number;
  name: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
};
/**
 * Lista de pantallas de la aplicación.
 *
 * Cada propiedad representa una pantalla.
 *
 * El valor "undefined" significa
 * que esa pantalla no recibe parámetros.
 */
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  NewProduct: undefined;
  inventory: { filter?: 'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' } | undefined;
  NewVariant: {
    productId: number;
  };
  Scan: undefined;
  ProductDetail: {
    productId: number;
  };

  EditProduct: {
    productId: number;
  };

  ScanResult: {
    productId: number;
  };

  Sales: undefined;

  SaleDetail: {
    saleId: number;
  };
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  brand_id: number;
  category_id: number;
  sale_price: number;
  active: number;
  created_at: string;
  updated_at: string;
};
export interface CatalogItem {
  id: number;
  name: string;
}

export type InventoryProduct = {
  id: number;
  name: string;
  brand: string;
  category: string;
  sale_price: number;
  total_stock: number;
  variants: number;
};

export type Props = {
  product: InventoryProduct;
  onPress: () => void;
};

export type ProductDetail = {
  id: number;
  name: string;
  description: string;
  brand_id: number;
  category_id: number;
  brand: string;
  category: string;
  sale_price: number;
};

export type ProductVariantDetail = {
  id: number;
  color: string;
  size: string;
  barcode: string;
  available_stock: number;
  minimum_stock: number;
};

export type DashboardStats = {
  todaySales: number;
  products: number;
  variants: number;
  lowStock: number;
  outOfStock: number;
};
