import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export const BlogEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        published: false
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        if (id) {
            // Editing existing post
            const fetchPost = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_BASE_URL}/blog/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const post = response.data;
                    setFormData({
                        title: post.title,
                        content: post.content,
                        category: post.category,
                        tags: post.tags.join(', '),
                        published: post.published
                    });
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Failed to fetch post');
                }
            };
            fetchPost();
        }
    }, [id, isAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            if (id) {
                // Update existing post
                await axios.put(`${API_BASE_URL}/blog/${id}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                // Create new post
                await axios.post(`${API_BASE_URL}/blog`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {id ? 'Edit Post' : 'Create New Post'}
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter post title"
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Data Analytics, Machine Learning, Big Data"
                        />
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., python, visualization, trends"
                        />
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content *
                        </label>
                        <textarea
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                            placeholder="Write your blog post content here..."
                        />
                    </div>

                    {/* Published Toggle */}
                    <div className="mb-8">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.published}
                                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Publish immediately
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8">
                            Unpublished posts will be saved as drafts
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Saving...' : (id ? 'Update Post' : 'Create Post')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};
