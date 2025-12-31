import React, { useState, useCallback } from 'react';
import { parseFile } from '../services/fileParser';
import { prepareEncryptedUpload } from '../services/encryptionService';
import { uploadEncryptedDataset, uploadNonEncryptedDataset } from '../services/uploadService';

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

        try {
            // Remove file extension from name
            const baseName = file.name.replace(/\.[^/.]+$/, '');

            // If user requested encryption, prompt for password and upload encrypted blob
            if (encryptOnUpload) {
                const password = window.prompt('Enter password to encrypt this file');
                if (!password) throw new Error('Encryption password is required');

                // Prepare encrypted upload data
                const encryptedData = await prepareEncryptedUpload(file, password);
                
                // Upload encrypted dataset
                await uploadEncryptedDataset({
                    name: baseName,
                    fileName: file.name,
                    fileSize: file.size,
                    encryptedData,
                    label: baseName,
                    mimeType: file.type
                });

                setIsUploading(false);
                setFileName(null);
                onUploadSuccess();
                return;
            }

            // Parse file for non-encrypted upload
            const parsedData = await parseFile(file);
            
            // Validate data
            if (parsedData.data.length === 0) {
                throw new Error('File contains no data');
            }

            // Upload non-encrypted dataset
            await uploadNonEncryptedDataset({
                name: baseName,
                fileName: file.name,
                fileSize: file.size,
                parsedData
            });

            setIsUploading(false);
            setFileName(null);
            onUploadSuccess();
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
