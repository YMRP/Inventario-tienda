import { hashPassword } from '@/utils/hash';
import { execute, getOne, getAll } from './db';

/**
 * responsabilidad:
 * Inserta datos iniciales.
 */
export async function seedDatabase() {
 

  console.log('Entro al seed database');

  await seedAdmin();

  console.log('seed admin');
  await seedCategories();

  console.log('seed categories');

  await seedColors();
  console.log('seed colors');

  await seedSizes();
  console.log('seed size');

  await seedBrands();
  console.log('seed brands');

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
  try {
    // ===========================
    // ADMIN
    // ===========================

    const existingAdmin = await getOne(
      `
      SELECT id
      FROM users
      WHERE username = ?
      `,
      ['admin']
    );

    if (!existingAdmin) {
      const adminHash = hashPassword('admin123');

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
        ['admin', 'Administrador', adminHash, 'ADMIN']
      );
    }

    // ===========================
    // STANDARD
    // ===========================

    const existingEmployee = await getOne(
      `
      SELECT id
      FROM users
      WHERE username = ?
      `,
      ['empleado']
    );

    if (!existingEmployee) {
      const employeeHash = hashPassword('empleado123');

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
        ['empleado', 'Empleado', employeeHash, 'STANDARD']
      );
    }
  } catch (error) {
    console.log(error);
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
