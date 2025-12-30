import React from 'react';
import { calculateStoragePercentage, formatFileSize } from '../utils/formatters';

interface StorageUsageProps {
    used: number; // in bytes
    total: number; // in bytes
    onUpgrade?: () => void;
}

export const StorageUsage: React.FC<StorageUsageProps> = ({ used, total, onUpgrade }) => {
    const percentage = calculateStoragePercentage(used, total);
    const usedGB = (used / (1024 * 1024 * 1024)).toFixed(1);
    const totalGB = (total / (1024 * 1024 * 1024)).toFixed(0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Storage Usage</h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {usedGB}GB of {totalGB}GB used
            </p>

            <button
                onClick={onUpgrade}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline"
            >
                Upgrade Plan
            </button>
        </div>
    );
};
