import { File } from 'expo-file-system';

import { closeDatabase, getDatabase } from '@/database/connection';
import { runMigrations } from '@/database/db';

export async function resetDatabase() {
  console.log('========== RESET DATABASE ==========');

  // Obtener ruta física
  const db = await getDatabase();

  const databasePath = db.databasePath;

  // Cerrar SQLite
  await closeDatabase();

  console.log('SQLite cerrada');

  // Archivo físico
  const databaseFile = new File(`file://${databasePath}`);

  if (databaseFile.exists) {
    databaseFile.delete();

    console.log('BD eliminada');
  }

  // Crear nuevamente SQLite
  await getDatabase();

  console.log('Nueva BD creada');

  // Ejecutar migraciones
  await runMigrations();

  console.log('Migraciones ejecutadas');


  console.log('========== RESET FINALIZADO ==========');

  return true;
}