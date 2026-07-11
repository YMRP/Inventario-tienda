import bcrypt from "bcryptjs";

import { execute, getAll, getOne } from "@/database/db";

import {  User, CreateUserProps } from "@/types/types";
import { getCurrentDateTime } from "@/utils/date";


//Obtenemos el usuario antes de cualquier cosa
//Promise<User | null> significa: puede devolver User o Null
export async function findByUsername(username: string): Promise<User | null> {
    return await getOne<User>(`SELECT * FROM users WHERE username = ? LIMIT 1`, [username])
}


export async function createUser(
  params: CreateUserProps
): Promise<void> {

  const passwordHash =
    await bcrypt.hash(
      params.password,
      10
    );

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
    [
      params.username,
      params.fullName,
      passwordHash,
      params.role
    ]
  );
}

//Verificacion de la contraseña con hash


/**
 * Obtiene todos los usuarios.
 */
export async function getAllUsers(): Promise<User[]> {

  return await getAll<User>(
    `
      SELECT *
      FROM users
      ORDER BY username
    `
  );
}

/**
 * Cambia la contraseña
 * de un usuario.
 */
export async function changePassword(
  userId: number,
  newPassword: string
): Promise<void> {

  const passwordHash =
    await bcrypt.hash(
      newPassword,
      10
    );

  await execute(
    `
      UPDATE users
      SET
        password_hash = ?,
        updated_at = ?
      WHERE id = ?
    `,
    [
      passwordHash,getCurrentDateTime(),
      userId
    ]
  );
}

/**
 * Activa o desactiva
 * un usuario.
 */
export async function setUserStatus(
  userId: number,
  active: number
): Promise<void> {

 await execute(
  `
  UPDATE users
  SET
    active = ?,
    updated_at = ?
  WHERE id = ?
  `,
  [
    active,
    getCurrentDateTime(),
    userId
  ]
);
}
//PARA CUANDO VUELVA A VER ESTE CODIGO: PENDIENTE COMENZAR A PROBAR EL LOGIN 