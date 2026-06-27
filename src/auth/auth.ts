import { User, LoginResult } from '@/types/types';
import { findByUsername } from '@/repositories/userRepository';
import { hashPassword, verifyPassword } from '@/utils/hash';

let currentUser: User | null = null;

export async function login(username: string, password: string): Promise<LoginResult> {
  console.log('Entro a login');

  const user = await findByUsername(username);

  console.log('El usuario existe:', !!user);

  if (!user) {
    return {
      success: false,
      user: null,
      message: 'El usuario no existe',
    };
  }

  if (user.active !== 1) {
    return {
      success: false,
      user: null,
      message: 'Usuario inactivo',
    };
  }

  const passwordIsCorrect = await verifyPassword(password, user.password_hash);

  console.log('PASSWORD OK:', passwordIsCorrect);

  if (!passwordIsCorrect) {
    return {
      success: false,
      user: null,
      message: 'Contraseña incorrecta',
    };
  }

  const result = {
    success: true,
    user,
    message: 'Inicio exitoso',
  };
  console.log('RAW PASSWORD:', JSON.stringify(password));
  console.log('RESULT FINAL:', result);

  currentUser = user;

  return result;
}

//LOGOUT PARA CERRAR SESION
export function logout() {
  currentUser = null;
}

export function getCurrentUser(): User | null {
  return currentUser;
}
