import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { getDatabase } from '@/database/connection';

export async function createBackup() {
  try {
    const db = await getDatabase();

    const sourceFile = new File(`file://${db.databasePath}`);
    console.log(sourceFile.uri);
    console.log(sourceFile.exists);
    console.log('Existe BD:', sourceFile.exists);

    const backupName = `inventory_backup_${Date.now()}.db`;

    const backupFile = new File(Paths.cache, backupName);

    sourceFile.copy(backupFile);

    console.log('Existe respaldo:', backupFile.exists);
    console.log('URI respaldo:', backupFile.uri);

    const available = await Sharing.isAvailableAsync();

    if (!available) {
      throw new Error('No es posible compartir archivos.');
    }

    await Sharing.shareAsync(backupFile.uri, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Guardar respaldo',
    });

    backupFile.delete();
  } catch (error) {
    console.log('BACKUP ERROR');
    console.log(error);
  }
}
