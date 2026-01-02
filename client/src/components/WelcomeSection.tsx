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

            {/* New Project button removed */}
        </div>
    );
};
