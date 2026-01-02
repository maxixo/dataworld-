import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { decryptToBlob, decryptFilename } from '../utils/fileEncryption';

interface Props {
  id: string;
  label?: string | null;
  onClose: () => void;
}

export const LockedFileViewer: React.FC<Props> = ({ id, label, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
// Request JSON with metadata (reliable transmission)
      const resp = await axios.get(`${API_BASE_URL}/datasets/${id}/blob?raw=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Parse metadata from JSON response
      const { blob: base64Blob, salt, iv, encryptedFileName, 
              encryptedFileNameSalt, encryptedFileNameIv, mimeType: serverMime } = resp.data;
      
// Convert base64 to ArrayBuffer
      const binaryString = atob(base64Blob);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
// Decrypt blob and filename
      const blob = await decryptToBlob(bytes.buffer, password, salt, iv, serverMime as string);
      const filename = encryptedFileName
        ? await decryptFilename(encryptedFileName, password, encryptedFileNameSalt, encryptedFileNameIv)
        : (label || `file-${id}`);
// Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLoading(false);
      onClose();
    } catch (err: any) {
setError(err.response?.data?.message || err.message || 'Decryption failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">Decrypt & Download</h3>
        <p className="text-sm text-gray-600 mb-4">Enter the password to decrypt "{label || id}"</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 rounded border mb-3"
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleDecrypt} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Decrypting...' : 'Decrypt & Download'}
          </button>
        </div>
      </div>
    </div>
  );
};
