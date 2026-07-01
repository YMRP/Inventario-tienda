/*
ROLES PERMITIDOS
*/

export type UserRole = 'ADMIN' |'STANDARD'

export type User = {
  id: number;
  username: string;
  full_name: string;
  password_hash: string;
  role: UserRole;
  active: number;
  created_at: string;
  updated_at: string;
}

export type CreateUserProps = {
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export type LoginResult = {
  success: boolean
  user: User | null
  message: string
}

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
}
export interface CatalogItem {
  id: number;
  name: string;
}

