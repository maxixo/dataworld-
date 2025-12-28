import React from 'react';

interface WelcomeSectionProps {
    username: string;
    onNewProject?: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ username, onNewProject }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Here's what's happening with your data today.
                </p>
            </div>

            <button
                onClick={onNewProject}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
            </button>
        </div>
    );
};
