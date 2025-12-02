// src/lib/tinyCrypt.ts

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12;   // bytes (AES-GCM 推奨)

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * パスフレーズは normalize してから使う（全角/半角事故防止）
 */
function normalizePassphrase(raw: string): string {
  return raw.trim().normalize("NFKC");
}

/**
 * Uint8Array -> base64
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * base64 -> Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * パスフレーズ + salt から AES-GCM 鍵を作る
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const normalized = normalizePassphrase(passphrase);
  const passphraseBytes = encoder.encode(normalized);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passphraseBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,  
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * 平文stringを暗号化して base64 string に
 * （salt + iv + ciphertext を1本にまとめてbase64化）
 */
export async function encryptToBase64(
  plaintext: string,
  passphrase: string
): Promise<string> {
  const data = encoder.encode(plaintext);

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(passphrase, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data
  );

  const cipherBytes = new Uint8Array(cipherBuffer);

  // [salt(16) | iv(12) | cipher(...)] を連結
  const packed = new Uint8Array(SALT_LENGTH + IV_LENGTH + cipherBytes.byteLength);
  packed.set(salt, 0);
  packed.set(iv, SALT_LENGTH);
  packed.set(cipherBytes, SALT_LENGTH + IV_LENGTH);

  return bytesToBase64(packed);
}

/**
 * encryptToBase64 した文字列を復号して平文stringに戻す
 * パスフレーズが違う/データ壊れてる場合は null
 */
export async function decryptFromBase64(
  base64: string,
  passphrase: string
): Promise<string | null> {
  try {
    const packed = base64ToBytes(base64);

    const salt = packed.slice(0, SALT_LENGTH);
    const iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const cipherBytes = packed.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(passphrase, salt);

    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      cipherBytes
    );

    return decoder.decode(plaintextBuffer);
  } catch (e) {
    console.error("decryptFromBase64 failed:", e);
    return null;
  }
}
