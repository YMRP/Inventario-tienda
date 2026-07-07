import { hashPassword } from '@/utils/hash';
import { execute, getOne, getAll } from './db';

/**
 * responsabilidad:
 * Inserta datos iniciales.
 */
export async function seedDatabase() {
  console.log("Entro al seed database");

  await seedAdmin();

  await seedVariantTemplates();

  await seedCategories();

  await seedColors();

  await seedSizes();

  await seedBrands();

  const users = await getAll(`
    SELECT *
    FROM users
  `);

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
  const categories = [
    {
      name: 'Playeras',
      template: 'Ropa',
    },
    {
      name: 'Pantalones',
      template: 'Pantalón',
    },
    {
      name: 'Vestidos',
      template: 'Ropa',
    },
    {
      name: 'Sudaderas',
      template: 'Ropa',
    },
    {
      name: 'Accesorios',
      template: 'Unitalla',
    },
  ];

  for (const category of categories) {
    const template = await getOne<{ id: number }>(
      `
      SELECT id
      FROM variant_templates
      WHERE name = ?
      `,
      [category.template]
    );

    if (!template) continue;

    await execute(
      `
      INSERT OR IGNORE
      INTO categories
      (
        name,
        variant_template_id
      )
      VALUES (?, ?)
      `,
      [category.name, template.id]
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
  const templates = [
    {
      template: 'Ropa',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      template: 'Calzado',
      sizes: [
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
      ],
    },
    {
      template: 'Pantalón',
      sizes: [
        '28',
        '30',
        '32',
        '34',
        '36',
        '38',
        '40',
      ],
    },
    {
      template: 'Unitalla',
      sizes: ['Unitalla'],
    },
  ];

  for (const item of templates) {
    const template = await getOne<{ id: number }>(
      `
      SELECT id
      FROM variant_templates
      WHERE name = ?
      `,
      [item.template]
    );

    if (!template) continue;

    for (const size of item.sizes) {
      await execute(
        `
        INSERT OR IGNORE
        INTO sizes
        (
          template_id,
          name
        )
        VALUES (?, ?)
        `,
        [template.id, size]
      );
    }
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

async function seedVariantTemplates() {
  const templates = [
    'Ropa',
    'Calzado',
    'Pantalón',
    'Unitalla',
  ];

  for (const template of templates) {
    await execute(
      `
      INSERT OR IGNORE
      INTO variant_templates(name)
      VALUES(?)
      `,
      [template]
    );
  }
}
