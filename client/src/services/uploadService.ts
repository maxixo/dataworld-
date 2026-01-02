import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import type { ParsedFile } from './fileParser';
import type { EncryptedUploadData } from './encryptionService';

export interface UploadOptions {
  name: string;
  fileName: string;
  fileSize: number;
}

export interface EncryptedUploadOptions extends UploadOptions {
  encryptedData: EncryptedUploadData;
  label: string;
  mimeType: string;
}

export interface NonEncryptedUploadOptions extends UploadOptions {
  parsedData: ParsedFile;
}

/**
 * Upload an encrypted dataset to the server
 */
export async function uploadEncryptedDataset(options: EncryptedUploadOptions): Promise<void> {
  const { name, fileName, fileSize, encryptedData, label, mimeType } = options;
  const token = localStorage.getItem('token');
  
const response = await axios.post(
    `${API_BASE_URL}/datasets`,
    {
      name,
      fileName,
      fileSize,
      // Encrypted payload
      encryptedBlobBase64: encryptedData.encryptedBlobBase64,
      salt: encryptedData.salt,
      iv: encryptedData.iv,
      isEncrypted: true,
      label,
      encryptedFileName: encryptedData.encryptedFileName,
      encryptedFileNameSalt: encryptedData.encryptedFileNameSalt,
      encryptedFileNameIv: encryptedData.encryptedFileNameIv,
      mimeType
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.status === 200) {
}
}

/**
 * Upload a non-encrypted (parsed) dataset to the server
 */
export async function uploadNonEncryptedDataset(options: NonEncryptedUploadOptions): Promise<void> {
  const { name, fileName, fileSize, parsedData } = options;
  const token = localStorage.getItem('token');
  
const response = await axios.post(
    `${API_BASE_URL}/datasets`,
    {
      name,
      fileName,
      fileSize,
      data: parsedData.data,
      columns: parsedData.columns,
      rowCount: parsedData.data.length
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.status === 200) {
}
}
