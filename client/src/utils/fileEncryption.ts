/* Web Crypto based file encryption utilities
 * - deriveKey(password, salt)
 * - encryptBlob(blob, password) -> { encryptedBlob, salt, iv }
 * - decryptBlob(encryptedArrayBuffer, password, salt, iv) -> Blob
 * - encryptFilename / decryptFilename (returns hex)
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const KEY_LENGTH = 256; // AES-256-GCM
const PBKDF2_ITER = 100_000;

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hexStr: string) {
  const bytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(s => parseInt(s, 16)));
  return bytes.buffer;
}

export async function generateRandomBytes(len = 16): Promise<Uint8Array> {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

export async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const salt = new Uint8Array(fromHex(saltHex));
  const pwKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITER,
      hash: 'SHA-256'
    },
    pwKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt','decrypt']
  );

  return key;
}

export async function encryptBlob(blob: Blob, password: string) {
  const salt = await generateRandomBytes(16);
  const iv = await generateRandomBytes(12); // 96-bit IV recommended for GCM
  const key = await deriveKey(password, hex(salt.buffer));

  const data = await blob.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const encryptedBuffer = encrypted as ArrayBuffer;

  // Return encrypted blob and hex-encoded metadata
  return {
    encryptedBlob: new Blob([new Uint8Array(encryptedBuffer)], { type: blob.type }),
    salt: hex(salt.buffer),
    iv: hex(iv.buffer)
  };
}

export async function decryptToBlob(encryptedBuffer: ArrayBuffer, password: string, saltHex: string, ivHex: string, mimeType = 'application/octet-stream') {
  const key = await deriveKey(password, saltHex);
  const iv = new Uint8Array(fromHex(ivHex));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedBuffer);
  return new Blob([new Uint8Array(decrypted)], { type: mimeType });
}

export async function encryptFilename(name: string, password: string) {
  const { encryptedBlob, salt, iv } = await encryptBlob(new Blob([name], { type: 'text/plain' }), password);
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  return { encryptedNameHex: hex(arrayBuffer), salt, iv };
}

export async function decryptFilename(encryptedHex: string, password: string, salt: string, iv: string) {
  const buf = fromHex(encryptedHex);
  const blob = await decryptToBlob(buf, password, salt, iv, 'text/plain');
  const text = await blob.text();
  return text;
}
