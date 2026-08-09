import crypto from "node:crypto";
import { ErrorHandler } from "../helper";
import { BAD_REQUEST } from "./status-codes";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  return crypto.createHash("sha256").update(String(process.env.CRYPTO_ENCRYPTION_SECRET)).digest();
}

export async function encryptData(data: unknown): Promise<string> {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch {
    throw new ErrorHandler(BAD_REQUEST, "Failed to encrypt data");
  }
}

export async function decryptData<T = unknown>(encryptedData: string): Promise<T> {
  try {
    const [ivHex, authTagHex, ciphertext] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted) as T;
  } catch {
    throw new ErrorHandler(BAD_REQUEST, "Failed to decrypt data");
  }
}
