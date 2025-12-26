import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface DraftPost {
    _id: string;
    title: string;
    category: string;
    updatedAt: string;
}

export const DraftsSidebar: React.FC = () => {
    const { isAdmin } = useAuth();
    const [drafts, setDrafts] = useState<DraftPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/blog/user/drafts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setDrafts(response.data);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch drafts');
            } finally {
                setLoading(false);
            }
        };

        fetchDrafts();
    }, []);

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    My Drafts
                </h3>
                <Link
                    to="/admin/blog/new"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                    + New
                </Link>
            </div>

            {loading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && (
                <>
                    {drafts.length === 0 ? (
                        <div className="text-center py-6">
                            <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-gray-500 dark:text-gray-400">No drafts yet</p>
                            <Link
                                to="/admin/blog/new"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                            >
                                Create your first draft
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {drafts.map((draft) => (
                                <Link
                                    key={draft._id}
                                    to={`/admin/blog/edit/${draft._id}`}
                                    className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                                        {draft.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                                            {draft.category}
                                        </span>
                                        <span>
                                            {new Date(draft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
