import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface DraftData {
    _id?: string;
    title: string;
    content: string;
}

export const DraftEditor: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('Untitled Draft');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const maxWords = 1000;
    const wordCountValid = wordCount <= maxWords;

    useEffect(() => {
        if (id) {
            fetchDraft();
        }
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSaved(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [saved]);

    const fetchDraft = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/drafts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTitle(response.data.title);
            setContent(response.data.content);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to load draft');
            navigate('/drafts');
        }
    };

    const handleSave = async () => {
        if (!wordCountValid) {
            setError(`Draft exceeds maximum word count of ${maxWords} words`);
            return;
        }

        if (!content.trim()) {
            setError('Please enter some content');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const draftData = { title, content };

            let response;
            if (id) {
                // Update existing draft
                response = await axios.put(`${API_BASE_URL}/drafts/${id}`, draftData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Create new draft
                response = await axios.post(`${API_BASE_URL}/drafts`, draftData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setSaving(false);
            setSaved(true);

            // If creating a new draft, redirect to edit mode with the new ID
            if (!id && response.data._id) {
                navigate(`/draft/${response.data._id}`, { replace: true });
            }
        } catch (err: any) {
            setSaving(false);
            setError(err.response?.data?.message || 'Failed to save draft');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBack = () => {
        if (content.trim() && !id) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate('/drafts');
            }
        } else {
            navigate('/drafts');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <Header
                username={user?.username || 'User'}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Drafts
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {saved && (
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Saved!
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                                saving
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Editor */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Title Input */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Draft Title"
                            className="w-full px-6 py-4 text-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none"
                        />
                    </div>

                    {/* Content Textarea */}
                    <div className="p-6">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your draft here..."
                            className="w-full h-[500px] resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none text-lg leading-relaxed"
                        />
                    </div>

                    {/* Footer with Word Count */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className={`text-sm ${wordCountValid ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                            {wordCount} / {maxWords} words
                            {!wordCountValid && ' (limit exceeded)'}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                            Auto-save disabled. Click Save to save changes.
                        </span>
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips:</h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Maximum word count is {maxWords} words</li>
                        <li>• Click the Save button to save your draft</li>
                        <li>• You can edit your draft anytime from the Drafts page</li>
                        <li>• Use the Back button to return to the Drafts list</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};
