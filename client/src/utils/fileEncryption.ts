/* Web Crypto based file encryption utilities
 * - deriveKey(password, salt)
 * - encryptBlob(blob, password) -> { encryptedBlob, salt, iv }
 * - decryptToBlob(encryptedArrayBuffer, password, salt, iv) -> Blob
 * - encryptFilename / decryptFilename (returns hex)
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const KEY_LENGTH = 256; // AES-256-GCM
const PBKDF2_ITER = 100_000;

function hex(input: ArrayBuffer | Uint8Array): string {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
  return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hexStr: string): ArrayBuffer {
  if (!hexStr) return new ArrayBuffer(0);
  const pairs = hexStr.match(/.{1,2}/g) || [];
  const bytes = new Uint8Array(pairs.map(s => parseInt(s, 16)));
  return bytes.buffer as ArrayBuffer;
}

export async function generateRandomBytes(len = 16): Promise<Uint8Array> {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

export async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const saltBuf = fromHex(saltHex);
  const salt = new Uint8Array(saltBuf);
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
    ['encrypt', 'decrypt']
  );

  return key;
}

export async function encryptBlob(blob: Blob, password: string) {
  const salt = await generateRandomBytes(16);
  const iv:any = await generateRandomBytes(12);
  const key = await deriveKey(password, hex(salt));

  const data = await blob.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, 
    key, 
    data
  );
  const encryptedBuffer = encrypted as ArrayBuffer;

  return {
    encryptedBlob: new Blob([new Uint8Array(encryptedBuffer)], { type: blob.type }),
    salt: hex(salt),
    iv: hex(iv)
  };
}

export async function decryptToBlob(
  encryptedBuffer: ArrayBuffer, 
  password: string, 
  saltHex: string, 
  ivHex: string, 
  mimeType = 'application/octet-stream'
) {
  const key = await deriveKey(password, saltHex);
  const ivBuf = fromHex(ivHex);
  const ivBytes = new Uint8Array(ivBuf);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes }, 
    key, 
    encryptedBuffer
  );
  return new Blob([new Uint8Array(decrypted)], { type: mimeType });
}

export async function encryptFilename(name: string, password: string) {
  const { encryptedBlob, salt, iv } = await encryptBlob(
    new Blob([name], { type: 'text/plain' }), 
    password
  );
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  return { 
    encryptedNameHex: hex(new Uint8Array(arrayBuffer)), 
    salt, 
    iv 
  };
}

export async function decryptFilename(
  encryptedHex: string, 
  password: string, 
  salt: string, 
  iv: string
) {
  const buf = fromHex(encryptedHex);
  const blob = await decryptToBlob(buf, password, salt, iv, 'text/plain');
  const text = await blob.text();
  return text;
}
