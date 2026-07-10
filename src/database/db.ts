import { getDatabase } from './connection';
import { migrations } from './migrations';
import { seedDatabase } from './seed';

/**
 * Ejecuta todas las migraciones.
 *
 * Crea las tablas de la base de datos.
 */
export async function runMigrations() {
  const db = await getDatabase();

  try {
    await db.execAsync(`
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY
);
`);
    for (let i = 0; i < migrations.length; i++) {
      const executed = await db.getFirstAsync<{ version: number }>(
        `
    SELECT version
    FROM schema_migrations
    WHERE version = ?
    `,
        [i]
      );

      if (executed) {
        continue;
      }

      await db.execAsync(migrations[i]);

      await db.runAsync(
        `
    INSERT INTO schema_migrations(version)
    VALUES(?)
    `,
        [i]
      );
    }

    console.log('Migraciones terminadas');

    await seedDatabase();

    console.log('Seed terminado');
  } catch (error) {
    console.log('ERROR EN MIGRACIONES');
    console.log(error);
  }
}
/**
 * Ejecuta INSERT, UPDATE o DELETE.
 */
export async function execute(sql: string, params: any[] = []) {
  const db = await getDatabase();

  return await db.runAsync(sql, params);
}

/**
 * Obtiene un único registro.
 */
export async function getOne<T>(sql: string, params: any[] = []): Promise<T | null> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<T>(sql, params);

  return result ?? null;
}

/**
 * Obtiene múltiples registros.
 */
export async function getAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();

  const result = await db.getAllAsync<T>(sql, params);

  return result;
}

/**
 * Ejecuta múltiples operaciones
 * dentro de una transacción.
 *
 * Si algo falla:
 * se revierte todo.
 */
export async function executeTransaction(callback: (db: any) => Promise<void>) {
  const db = await getDatabase();

  try {
    await db.execAsync('BEGIN TRANSACTION');

    await callback(db);

    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');

    throw error;
  }
}

//COMENZANDO CON LOS FEATURES PARA CREAR FUNCIONES DE AUTH
