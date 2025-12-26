import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

interface Dataset {
    _id: string;
    name: string;
    rowCount: number;
    columns: string[];
    createdAt: string;
}

export const DatasetList: React.FC = () => {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/datasets`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setDatasets(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch datasets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Demo CSV Download Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Need sample data to test?
                        </h3>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Download our demo CSV file with sample sales data
                        </p>
                    </div>
                    <a
                        href="/demo-data.csv"
                        download="demo-data.csv"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Download Demo CSV
                    </a>
                </div>
            </div>

            {/* Datasets List */}
            {datasets.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        No datasets uploaded yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Upload your first CSV file to get started
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {datasets.map((dataset) => (
                        <Link
                            key={dataset._id}
                            to={`/dataset/${dataset._id}`}
                            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {dataset.name}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">{dataset.rowCount}</span> rows
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">{dataset.columns.length}</span> columns
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                            {new Date(dataset.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
