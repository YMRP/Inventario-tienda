import { File, Paths } from 'expo-file-system';

import { getDatabase } from '@/database/connection';

export interface StorageInfo {
  databaseSize: number;
  freeSpace: number;
}

export async function getStorageInfo(): Promise<StorageInfo> {
    console.log('Entró a getStorageInfo');
  const db = await getDatabase();

  const databaseFile = new File(`file://${db.databasePath}`);
console.log('Espacio libre:', Paths.availableDiskSpace);
console.log('Espacio total:', Paths.totalDiskSpace);
  return {
    databaseSize: databaseFile.size ?? 0,
    freeSpace: Paths.availableDiskSpace ?? 0,
  };
}