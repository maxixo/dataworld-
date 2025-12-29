import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { WelcomeSection } from '../components/WelcomeSection';
import { FileUpload } from '../components/FileUpload';
import { DatasetFilters } from '../components/DatasetFilters';
import type { FilterType } from '../components/DatasetFilters';
import { DatasetCard } from '../components/DatasetCard';
import RecentActivity from '../components/RecentActivity';
import type { ActivityItem } from '../components/RecentActivity';
import { StorageUsage } from '../components/StorageUsage';
import { API_BASE_URL } from '../config/api';
import { getFileType } from '../utils/formatters';

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

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [storageUsed, setStorageUsed] = useState(0);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/datasets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDatasets(response.data);
            setFilteredDatasets(response.data);

            // Calculate total storage used
            const totalSize = response.data.reduce((sum: number, dataset: Dataset) => {
                return sum + (dataset.fileSize || 0);
            }, 0);
            setStorageUsed(totalSize);

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

    useEffect(() => {
        // Generate activities from datasets
        if (datasets.length > 0) {
            const activityItems: ActivityItem[] = datasets.map((dataset) => ({
                id: dataset._id,
                type: 'upload' as const,
                title: `Uploaded ${dataset.name}`,
                timestamp: dataset.createdAt || new Date().toISOString(),
                status: 'completed' as const,
                user: `${dataset.rowCount} rows, ${dataset.columns.length} columns`
            })).slice(0, 10); // Show only 10 most recent

            setActivities(activityItems);
        }
    }, [datasets]);

    useEffect(() => {
        // Filter datasets based on active filter
        if (activeFilter === 'ALL') {
            setFilteredDatasets(datasets);
        } else {
            const filtered = datasets.filter((dataset) => {
                const fileType = getFileType(dataset.name).toUpperCase();
                if (activeFilter === 'EXCEL') {
                    return fileType === 'XLSX';
                }
                return fileType === activeFilter;
            });
            setFilteredDatasets(filtered);
        }
    }, [activeFilter, datasets]);

    const handleUploadSuccess = () => {
        fetchDatasets();
    };

    const handleDeleteDataset = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this dataset?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/datasets/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDatasets();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete dataset');
        }
    };

    const handleNewProject = () => {
        // Scroll to upload section
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpgrade = () => {
        alert('Upgrade feature coming soon!');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
                <Header
                    username={user?.username || 'User'}
                    onLogout={logout}
                />

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Welcome Section */}
                <WelcomeSection
                    username={user?.username || 'User'}
                    onNewProject={handleNewProject}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Upload + Datasets */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upload Section */}
                        <FileUpload onUploadSuccess={handleUploadSuccess} />

                        {/* Datasets Section */}
                        <div>
                            <DatasetFilters
                                activeFilter={activeFilter}
                                onFilterChange={setActiveFilter}
                            />

                            {/* Loading State */}
                            {loading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && filteredDatasets.length === 0 && datasets.length === 0 && (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
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
                                        Upload your first dataset to get started
                                    </p>
                                </div>
                            )}

                            {/* No results for filter */}
                            {!loading && !error && filteredDatasets.length === 0 && datasets.length > 0 && (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No {activeFilter.toLowerCase()} datasets found
                                    </p>
                                </div>
                            )}

                            {/* Dataset Grid */}
                            {!loading && !error && filteredDatasets.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredDatasets.map((dataset) => (
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
                        </div>
                    </div>

                    {/* Right Column: Activity + Storage */}
                    <div className="lg:col-span-1 space-y-6">
                        <RecentActivity activities={activities} />
                        <StorageUsage
                            used={storageUsed}
                            total={20 * 1024 * 1024 * 1024} // 20GB
                            onUpgrade={handleUpgrade}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};
