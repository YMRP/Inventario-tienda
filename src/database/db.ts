import * as SQLite from 'expo-sqlite'
import { migrations } from './migrations'

//Creando la base de datos, sí no existe, la crea.
const DATABBASE_NAME = 'inventory.db'

// Variable global donde guardaremos
// la conexión abierta.
let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase() {
    
}
