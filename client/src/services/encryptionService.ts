import { encryptBlob, encryptFilename } from '../utils/fileEncryption';

export interface EncryptedFile {
  encryptedBlob: Blob;
  salt: string;
  iv: string;
}

export interface EncryptedFilename {
  encryptedNameHex: string;
  salt: string;
  iv: string;
}

export interface EncryptedUploadData {
  encryptedBlobBase64: string;
  salt: string;
  iv: string;
  encryptedFileName: string;
  encryptedFileNameSalt: string;
  encryptedFileNameIv: string;
}

/**
 * Encrypt a file blob with AES-GCM encryption
 */
export async function encryptFile(file: File, password: string): Promise<EncryptedFile> {
  console.log('🔐 [ENCRYPTION] Starting file encryption - fileName:', file.name, 'fileSize:', file.size);
  const result = await encryptBlob(file, password);
  console.log('✓ [ENCRYPTION] File encrypted - salt:', result.salt, 'iv:', result.iv);
  return result;
}

/**
 * Encrypt a filename with AES-GCM encryption
 */
export async function encryptName(name: string, password: string): Promise<EncryptedFilename> {
  console.log('🔐 [ENCRYPTION] Starting filename encryption - name:', name);
  const result = await encryptFilename(name, password);
  console.log('✓ [ENCRYPTION] Filename encrypted - salt:', result.salt, 'iv:', result.iv, 'encrypted:', result.encryptedNameHex);
  return result;
}

/**
 * Prepare complete encrypted upload data for server
 */
export async function prepareEncryptedUpload(file: File, password: string): Promise<EncryptedUploadData> {
  // Encrypt the file blob
  const { encryptedBlob, salt, iv } = await encryptFile(file, password);
  
  // Encrypt the filename
  const { encryptedNameHex, salt: fnameSalt, iv: fnameIv } = await encryptName(file.name, password);
  
  // Convert encrypted blob to base64
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
  const encryptedBase64 = btoa(binary);
  
  console.log('✓ [ENCRYPTION] Encrypted upload prepared - base64Length:', encryptedBase64.length);
  
  return {
    encryptedBlobBase64: encryptedBase64,
    salt,
    iv,
    encryptedFileName: encryptedNameHex,
    encryptedFileNameSalt: fnameSalt,
    encryptedFileNameIv: fnameIv
  };
}
