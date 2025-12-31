import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { encryptBlob, encryptFilename } from '../utils/fileEncryption';
import { API_BASE_URL } from '../config/api';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [encryptOnUpload, setEncryptOnUpload] = useState<boolean>(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = async (file: File) => {
        setError(null);
        setFileName(file.name);
        setIsUploading(true);

        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        try {
            let data: any[] = [];
            let columns: string[] = [];

            // Process file based on type
            if (fileExtension === 'csv') {
                // Parse CSV using PapaParse
                await new Promise<void>((resolve, reject) => {
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            data = results.data;
                            columns = results.meta.fields || [];
                            resolve();
                        },
                        error: (err) => {
                            reject(new Error(`Failed to parse CSV: ${err.message}`));
                        }
                    });
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                // Parse Excel using xlsx library
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                
                if (jsonData.length > 0) {
                    data = jsonData;
                    columns = Object.keys(jsonData[0] || " " );
                } else {
                    throw new Error('Excel file is empty or has no data');
                }
            } else if (fileExtension === 'json') {
                // Parse JSON
                const text = await file.text();
                const jsonData = JSON.parse(text);
                
                if (Array.isArray(jsonData) && jsonData.length > 0) {
                    data = jsonData;
                    columns = Object.keys(jsonData[0] as object);
                } else {
                    throw new Error('JSON file must contain an array of objects');
                }
            } else {
                throw new Error('Unsupported file type. Please upload CSV, Excel, or JSON files.');
            }

            // Validate data
            if (data.length === 0) {
                throw new Error('File contains no data');
            }

            const rowCount = data.length;

            // Get token from localStorage
            const token = localStorage.getItem('token');

            // Remove file extension from name
            const baseName = file.name.replace(/\.[^/.]+$/, '');

            // If user requested encryption, prompt for password and upload encrypted blob
            if (encryptOnUpload) {
                const password = window.prompt('Enter password to encrypt this file');
                if (!password) throw new Error('Encryption password is required');

                // Encrypt the raw file blob
                const { encryptedBlob, salt, iv } = await encryptBlob(file, password);

                // Encrypt filename as a small encrypted payload
                const { encryptedNameHex, salt: fnameSalt, iv: fnameIv } = await encryptFilename(file.name, password);

                // Convert encryptedBlob to base64
                const arrayBuffer = await encryptedBlob.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
                const encryptedBase64 = btoa(binary);

                const response = await axios.post(
                    `${API_BASE_URL}/datasets`,
                    {
                        name: baseName,
                        fileName: file.name,
                        fileSize: file.size,
                        // encrypted payload
                        encryptedBlobBase64: encryptedBase64,
                        salt,
                        iv,
                        isEncrypted: true,
                        label: baseName,
                        encryptedFileName: encryptedNameHex,
                        encryptedFileNameSalt: fnameSalt,
                        encryptedFileNameIv: fnameIv,
                        mimeType: file.type
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200) {
                    setIsUploading(false);
                    setFileName(null);
                    onUploadSuccess();
                }
                return;
            }

            // Upload non-encrypted parsed data to server
            const response = await axios.post(
                `${API_BASE_URL}/datasets`,
                {
                    name: baseName,
                    fileName: file.name,
                    fileSize: file.size,
                    data,
                    columns,
                    rowCount
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setIsUploading(false);
                setFileName(null);
                onUploadSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload dataset');
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 bg-gray-50 dark:bg-gray-800/50
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <input
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                />
                <div className="flex flex-col items-center gap-4">
                    {/* Blue Cloud Upload Icon */}
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>

                    {isUploading ? (
                        <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                            Uploading {fileName}...
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Upload New Dataset
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                Drag and drop CSV, JSON, or Excel files here to begin analysis.
                            </p>
                            <div className="flex flex-col items-center gap-2">
                                <label htmlFor="file-upload">
                                    <div className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors shadow-lg hover:shadow-xl">
                                        Browse Files
                                    </div>
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    <input type="checkbox" checked={encryptOnUpload} onChange={(e) => setEncryptOnUpload(e.target.checked)} />
                                    <span>Encrypt file before upload</span>
                                </label>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};
