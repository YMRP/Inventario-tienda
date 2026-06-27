import SHA256 from 'crypto-js/sha256';

/**
 * Genera el hash de una contraseña.
 */
export function hashPassword(password: string) {
  const clean = password.trim();

  return SHA256(clean).toString();
}

/**
 * Verifica una contraseña.
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  console.log("VERIFICANDO PASSWORD")
  const clean = password.trim();

  const generatedHash = SHA256(clean).toString();

  console.log('GENERATED:', generatedHash);
  console.log('DB HASH:', passwordHash);
  console.log('EQUAL:', generatedHash === passwordHash);

  return generatedHash === passwordHash;
}
