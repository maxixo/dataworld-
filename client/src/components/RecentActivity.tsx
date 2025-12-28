import React from 'react';
import { getRelativeTime } from '../utils/formatters';

export interface ActivityItem {
    id: string;
    type: 'upload' | 'process' | 'error' | 'share';
    title: string;
    timestamp: string;
    status?: 'completed' | 'automated' | 'failed';
    errorMessage?: string;
    user?: string;
}

export interface RecentActivityProps {
    activities: ActivityItem[];
}

 const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'upload':
                return (
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        </svg>
                    </div>
                );
            case 'process':
                return (
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'share':
                return (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return null;

        const badges = {
            completed: {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-700 dark:text-green-400'
            },
            automated: {
                bg: 'bg-gray-100 dark:bg-gray-700',
                text: 'text-gray-700 dark:text-gray-300'
            },
            failed: {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-700 dark:text-red-400'
            }
        };

        const badge = badges[status as keyof typeof badges];
        if (!badge) return null;

        return (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No recent activity
                    </p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                            {/* Icon */}
                            {getActivityIcon(activity.type)}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {activity.title}
                                    </h4>
                                    {getStatusBadge(activity.status)}
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {getRelativeTime(activity.timestamp)}
                                    {activity.user && ` • ${activity.user}`}
                                </p>

                                {activity.errorMessage && (
                                    <div className="mt-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            {activity.errorMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivity;