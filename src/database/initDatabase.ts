import { runMigrations } from './db';
import { seedDatabase } from './seed';

/**
 * Inicializa toda la base de datos.
 *
 * Flujo:
 * 1. Ejecutar migraciones
 * 2. Ejecutar seed
 */
export async function initDatabase() {
  try {
    console.log('Inicializando base de datos...');

    await runMigrations();

    await seedDatabase();

    console.log('Base de datos lista');
  } catch (error) {
    console.error(
      'Error inicializando BD:',
      error
    );

    throw error;
  }
}