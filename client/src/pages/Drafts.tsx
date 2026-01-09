import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

type TabType = 'drafts' | 'locked-notes' | 'trash';

interface Draft {
    _id: string;
    title: string;
    content: string;
    isEncrypted: boolean;
    label?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export const Drafts: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>('drafts');
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [selectedTrashIds, setSelectedTrashIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Read tab from URL on page load and when URL changes
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabParam = urlParams.get('tab') as TabType;
        if (tabParam === 'drafts' || tabParam === 'locked-notes' || tabParam === 'trash') {
            setActiveTab(tabParam);
        }
    }, [location.search]);

    // Refresh drafts when window regains focus
    useEffect(() => {
        const handleFocus = () => {
            fetchDrafts();
        };
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [activeTab]);

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/drafts?type=${activeTab}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDrafts(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch drafts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'trash') {
            setSelectedTrashIds([]);
            return;
        }

        setSelectedTrashIds((prev) =>
            prev.filter((id) => drafts.some((draft) => draft._id === id))
        );
    }, [activeTab, drafts]);

    const handleCreateNew = () => {
        navigate('/draft/new');
    };

    const handleDraftClick = (id: string) => {
        navigate(`/draft/${id}`);
    };

    const handleDeleteDraft = async (id: string) => {
        if (!window.confirm('Move this draft to trash?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/drafts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDrafts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete draft');
        }
    };

    const handleRestoreDraft = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/drafts/${id}/restore`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDrafts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to restore draft');
        }
    };

    const toggleTrashSelection = (id: string) => {
        setSelectedTrashIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleBulkDeleteDrafts = async () => {
        if (selectedTrashIds.length === 0) return;

        if (!window.confirm('Permanently delete selected drafts? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/drafts/trash/bulk-delete`, { ids: selectedTrashIds }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSelectedTrashIds([]);
            fetchDrafts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete drafts');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tabs = [
        { id: 'drafts' as TabType, label: 'Drafts', mobileLabel: 'Drafts', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )},
        { id: 'locked-notes' as TabType, label: 'Encrypted Notes', mobileLabel: 'Locked', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        )},
        { id: 'trash' as TabType, label: 'Trash', mobileLabel: 'Trash', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        )}
    ];

    const renderDraftsList = () => {
        if (loading) {
            return (
                <div className="flex flex-col justify-center items-center py-12 text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="mt-3 text-sm">Loading drafts...</span>
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

        if (drafts.length === 0) {
            const messages = {
                'drafts': 'No drafts yet',
                'locked-notes': 'No encrypted notes',
                'trash': 'Trash is empty'
            };
            const subMessages = {
                'drafts': 'Your saved drafts will appear here',
                'locked-notes': 'Encrypted notes will appear here',
                'trash': 'Deleted items will appear here'
            };
            
            return (
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
                    <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
                        {messages[activeTab]}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {subMessages[activeTab]}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {activeTab === 'trash' && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedTrashIds.length === 0
                                ? 'No items selected'
                                : `${selectedTrashIds.length} selected`}
                        </span>
                        <button
                            onClick={handleBulkDeleteDrafts}
                            disabled={selectedTrashIds.length === 0}
                            className={`inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedTrashIds.length === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            Delete All
                        </button>
                    </div>
                )}
                {drafts.map((draft) => (
                    <div
                        key={draft._id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        onClick={() => handleDraftClick(draft._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleDraftClick(draft._id);
                            }
                        }}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                {activeTab === 'trash' && (
                                    <input
                                        type="checkbox"
                                        checked={selectedTrashIds.includes(draft._id)}
                                        onChange={(event) => {
                                            event.stopPropagation();
                                            toggleTrashSelection(draft._id);
                                        }}
                                        onClick={(event) => event.stopPropagation()}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        aria-label={`Select ${draft.title}`}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                                    {draft.isEncrypted && draft.label ? draft.label : draft.title}
                                </h3>
                                {draft.isEncrypted && draft.label && (
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        🔒 Encrypted Note
                                    </p>
                                )}
                                {!draft.isEncrypted && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {draft.content.substring(0, 100)}{draft.content.length > 100 && '...'}
                                    </p>
                                )}
                                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(draft.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeTab === 'trash' ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRestoreDraft(draft._id);
                                        }}
                                        className="inline-flex items-center justify-center h-11 w-11 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        title="Restore"
                                        aria-label="Restore draft"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDraft(draft._id);
                                        }}
                                        className="inline-flex items-center justify-center h-11 w-11 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                        aria-label="Delete draft"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <Header
                username={user?.username || 'User'}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
                {/* Page Title */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Drafts
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your drafts, encrypted notes, and deleted items
                    </p>
                </div>

                {/* Mobile Tabs */}
                <div className="md:hidden mb-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-full border transition-colors whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                aria-pressed={activeTab === tab.id}
                            >
                                {tab.icon}
                                <span className="text-sm font-medium">
                                    <span className="sm:hidden">{tab.mobileLabel}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layout: Sidebar + Content */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <aside className="hidden md:block md:w-20 lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 lg:p-4 lg:sticky lg:top-24">
                            {/* User Profile */}
                            <div className="flex flex-col items-center pb-4 lg:pb-6 border-b border-gray-200 dark:border-gray-700 mb-4 lg:mb-6">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-bold mb-2 lg:mb-3">
                                    {user?.username.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <h3 className="hidden lg:block text-base font-semibold text-gray-900 dark:text-white">
                                    {user?.username || 'User'}
                                </h3>
                            </div>

                            {/* New Button */}
                            <button
                                onClick={handleCreateNew}
                                className="w-full min-h-[48px] mb-4 flex items-center justify-center gap-2 px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                aria-label="Create new draft"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="hidden lg:inline">New</span>
                            </button>

                            {/* Navigation */}
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full min-h-[48px] flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors text-left ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        aria-pressed={activeTab === tab.id}
                                    >
                                        {tab.icon}
                                        <span className="hidden lg:inline font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {renderDraftsList()}
                    </div>
                </div>
            </main>

            {/* Mobile Floating Action Button */}
            <button
                onClick={handleCreateNew}
                className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                aria-label="Create new draft"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
};
