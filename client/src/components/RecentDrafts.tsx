import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelativeTime } from '../utils/formatters';

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

export interface RecentDraftsProps {
    drafts: Draft[];
}

export const RecentDrafts: React.FC<RecentDraftsProps> = ({ drafts }) => {
    const navigate = useNavigate();

    const handleCreateDraft = () => {
        navigate('/drafts');
    };

    const handleDraftClick = (id: string) => {
        navigate(`/draft/${id}`);
    };

    const handleViewAll = () => {
        navigate('/drafts');
    };

    // Sort drafts by updated date and take only 5 most recent
    const recentDrafts = [...drafts]
        .filter(draft => !draft.isDeleted)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            {/* Create Draft Button */}
            <button
                onClick={handleCreateDraft}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-6"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Create Draft
            </button>

            {/* Recent Drafts Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Drafts</h3>
                <button
                    onClick={handleViewAll}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                    View All
                </button>
            </div>

            {/* Recent Drafts List */}
            <div className="space-y-3">
                {recentDrafts.length === 0 ? (
                    <div className="text-center py-8">
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
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            No drafts yet
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Create your first draft to get started
                        </p>
                    </div>
                ) : (
                    recentDrafts.map((draft) => (
                        <div
                            key={draft._id}
                            onClick={() => handleDraftClick(draft._id)}
                            className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                {draft.isEncrypted ? (
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {draft.isEncrypted && draft.label ? draft.label : draft.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {getRelativeTime(draft.updatedAt)}
                                    </p>
                                    {draft.isEncrypted && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                            🔒 Encrypted
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Arrow Icon */}
                            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentDrafts;
