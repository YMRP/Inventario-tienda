import { getDatabase } from './connection';
import { migrations } from './migrations';

/**
 * Ejecuta todas las migraciones.
 *
 * Crea las tablas de la base de datos.
 */
export async function runMigrations() {
  console.log("Iniciando migraciones")
  const db = await getDatabase();

  for (const migration of migrations) {
    console.log("en proceso de ejecucion de migraciones")
    await db.execAsync(migration);
  }

  console.log('Migraciones ejecutadas');
}

/**
 * Ejecuta INSERT, UPDATE o DELETE.
 */
export async function execute(sql: string, params: any[] = []) {
  const db = await getDatabase();

  return await db.runAsync(sql,params);
}

/**
 * Obtiene un único registro.
 */
export async function getOne<T>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const db = await getDatabase();

  const result =
    await db.getFirstAsync<T>(
      sql,
      params
    );

  return result ?? null;
}

/**
 * Obtiene múltiples registros.
 */
export async function getAll<T>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const db = await getDatabase();

  const result =
    await db.getAllAsync<T>(
      sql,
      params
    );

  return result;
}

/**
 * Ejecuta múltiples operaciones
 * dentro de una transacción.
 *
 * Si algo falla:
 * se revierte todo.
 */
export async function executeTransaction(
  callback: (db: any) => Promise<void>
) {
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