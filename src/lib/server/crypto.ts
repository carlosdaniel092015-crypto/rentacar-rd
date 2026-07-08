import "server-only";
import { randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";

// Cifra secretos de terceros (ej. credenciales GPS) antes de guardarlos en la
// BD. GPS_ENCRYPTION_KEY puede ser cualquier string secreto — se deriva a una
// clave AES-256 de 32 bytes vía SHA-256, así no exige un formato hex/base64 particular.
function getKey(): Buffer {
  const secret = process.env.GPS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("GPS_ENCRYPTION_KEY no está configurada.");
  }
  return createHash("sha256").update(secret).digest();
}

// Formato de salida: iv:authTag:ciphertext, todo en hex.
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, authTagHex, dataHex] = payload.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Formato de secreto cifrado inválido.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return plaintext.toString("utf8");
}
