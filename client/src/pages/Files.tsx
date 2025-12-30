import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { DatasetCard } from '../components/DatasetCard';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface Dataset {
    _id: string;
    name: string;
    rowCount: number;
    columns: string[];
    data: any[];
    fileSize?: number;
    createdAt: string;
    updatedAt?: string;
}

export const Files: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/datasets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDatasets(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const handleDeleteDataset = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/datasets/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDatasets();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete file');
        }
    };

    const handleViewChart = (id: string) => {
        navigate(`/dataset/${id}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <Header
                username={user?.username || 'User'}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        My Files
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage and view your uploaded data files
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && datasets.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400"
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
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                            No files yet
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Upload your first dataset to get started
                        </p>
                        <button
                            onClick={() => navigate('/app')}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}

                {/* Files Grid */}
                {!loading && !error && datasets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {datasets.map((dataset) => (
                            <DatasetCard
                                key={dataset._id}
                                id={dataset._id}
                                name={dataset.name}
                                updatedAt={dataset.updatedAt || dataset.createdAt}
                                fileSize={dataset.fileSize}
                                data={dataset.data}
                                onDelete={() => handleDeleteDataset(dataset._id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
