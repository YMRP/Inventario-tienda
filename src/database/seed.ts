
import { hashPassword } from '@/utils/hash';
import { execute, getOne, getAll } from './db';

/**
 * responsabilidad:
 * Inserta datos iniciales.
 */
export async function seedDatabase() {
  console.log("Entro al seed database")
  await seedAdmin();

  console.log("seed admin")
  await seedCategories();

    console.log("seed categories")

  await seedColors();
    console.log("seed colors")


  await seedSizes();
    console.log("seed size")


  await seedBrands();
   console.log("seed brands")

  const users = await getAll(
    `
  SELECT *
  FROM users
  `
  );


  console.log(users);
}

/**
 * Crea administrador inicial.
 */
async function seedAdmin() {
  try{

    console.log("entro a funcion seedAdmin")
    const existingUser = await getOne(
      `
      SELECT id
      FROM users
      WHERE username = ?
      `,
      ['admin']
    );
    console.log("existing user: ", existingUser)
  
    if (existingUser) {
      return;
    }
  
      console.log("2. Resultado del SELECT:", existingUser);
  
    const passwordHash =   hashPassword('admin123');
  console.log("5. Hash generado: ", passwordHash);
    await execute(
      `
      INSERT INTO users (
        username,
        full_name,
        password_hash,
        role
      )
      VALUES (?, ?, ?, ?)
      `,
      ['admin', 'Administrador', passwordHash, 'ADMIN']
    );
  }catch(error){
console.log("Error: ", error)
  }
}

/**
 * Categorías iniciales.
 */
async function seedCategories() {
  const categories = ['Playeras', 'Pantalones', 'Vestidos', 'Sudaderas', 'Accesorios'];

  for (const category of categories) {
    await execute(
      `
      INSERT OR IGNORE
      INTO categories(name)
      VALUES(?)
      `,
      [category]
    );
  }
}

/**
 * Colores iniciales.
 */
async function seedColors() {
  const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Gris', 'Beige'];

  for (const color of colors) {
    await execute(
      `
      INSERT OR IGNORE
      INTO colors(name)
      VALUES(?)
      `,
      [color]
    );
  }
}

/**
 * Tallas iniciales.
 */
async function seedSizes() {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unitalla'];

  for (const size of sizes) {
    await execute(
      `
      INSERT OR IGNORE
      INTO sizes(name)
      VALUES(?)
      `,
      [size]
    );
  }
}

/**
 * Marcas iniciales.
 */
async function seedBrands() {
  const brands = ['Sin Marca', 'Nike', 'Adidas', 'Puma', "Levi's"];

  for (const brand of brands) {
    await execute(
      `
      INSERT OR IGNORE
      INTO brand_catalog(name)
      VALUES(?)
      `,
      [brand]
    );
  }
}
