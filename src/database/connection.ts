import * as SQLite from 'expo-sqlite';

/**
 * Nombre físico del archivo SQLite.
 * Android creará algo similar a:
 * inventory.db
 */

//RESPONABILIDAD: ABRIR SQLITE SOLAMENTE
const DATABASE_NAME = 'inventory.db';

/**
 * Aquí guardaremos la conexión abierta.
 * Al inicio:
 * db = null
 * Después:
 * db contendrá la conexión SQLite.
 */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Devuelve una conexión SQLite.
 * Si la conexión ya existe:
 *   la reutiliza.
 * Si no existe:
 *   la crea.
 */
export async function getDatabase() {
  /**
   * ¿Ya tenemos una conexión abierta?
   */
  if (db) {
    return db;
  }

  /**
   * Si no existe conexión,
   * abrimos la base de datos.
   */
  db = await SQLite.openDatabaseAsync(
    DATABASE_NAME
  );

  /**
   * Devolvemos la conexión.
   */
  return db;
}