import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

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

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            setIsUploading(false);
            return;
        }

        // Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const data = results.data;
                    const columns = results.meta.fields || [];
                    const rowCount = data.length;

                    // Get token from localStorage
                    const token = localStorage.getItem('token');

                    // Upload to server
                    const response = await axios.post(
                        `${API_BASE_URL}/datasets`,
                        {
                            name: file.name.replace('.csv', ''),
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
                    setError(err.response?.data?.message || 'Failed to upload dataset');
                    setIsUploading(false);
                }
            },
            error: (err) => {
                setError(`Failed to parse CSV: ${err.message}`);
                setIsUploading(false);
            }
        });
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
          border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                        <svg
                            className="w-16 h-16 text-gray-400 dark:text-gray-500"
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
                        {isUploading ? (
                            <div className="text-blue-600 dark:text-blue-400 font-medium">
                                Uploading {fileName}...
                            </div>
                        ) : (
                            <>
                                <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    Drop your CSV file here, or click to browse
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Supports CSV files up to 10MB
                                </div>
                            </>
                        )}
                    </div>
                </label>
            </div>

            <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Need a sample?{' '}
                    <a
                        href="/demo-data.csv"
                        download="sample_data.csv"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        Download demo-data.csv
                    </a>
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
