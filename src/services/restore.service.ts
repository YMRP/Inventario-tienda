import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { closeDatabase, getDatabase } from '@/database/connection';
import * as Updates from 'expo-updates';

export async function selectBackupFile() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log('Selección cancelada');
      return null;
    }

    const file = result.assets[0];

    console.log('Nombre:', file.name);
    console.log('URI:', file.uri);

    return file;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function restoreBackup(backupUri: string) {
  try {
    console.log('========== RESTORE ==========');

    // Cerrar SQLite
    await closeDatabase();

    console.log('SQLite cerrada');

    // Ruta de la BD original
    // Obtener la ruta física de la BD
    const db = await getDatabase();

    const databasePath = db.databasePath;

    // Volver a cerrar para poder reemplazar el archivo
    await closeDatabase();

    console.log('Ruta BD:', databasePath);

    const databaseFile = new File(`file://${databasePath}`);

    console.log('Existe BD:', databaseFile.exists);

    if (databaseFile.exists) {
      databaseFile.delete();

      console.log('BD eliminada');
    }

    const backupFile = new File(backupUri);

    console.log('Existe respaldo:', backupFile.exists);

    backupFile.copy(databaseFile);

    console.log('Respaldo copiado');

    await getDatabase();

    console.log('SQLite abierta nuevamente');

    console.log('========== FIN RESTORE ==========');

    console.log('Paso 1');

    await getDatabase();

    console.log('Paso 2');

    return true;
  } catch (error) {
    console.log('RESTORE ERROR');

    if (error instanceof Error) {
      console.log('Mensaje:', error.message);
      console.log('Stack:', error.stack);
    } else {
      console.log(error);
    }

    return false;
  }
}
