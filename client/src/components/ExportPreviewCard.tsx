import React from 'react';

interface ExportPreviewCardProps {
    type: 'excel' | 'csv' | 'pdf' | 'json';
    title: string;
    fileSize: string;
    date: string;
    onExport?: () => void;
}

export const ExportPreviewCard: React.FC<ExportPreviewCardProps> = ({
    type,
    title,
    fileSize,
    date,
    onExport
}) => {
    const getIconAndColor = () => {
        switch (type) {
            case 'excel':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <rect x="8" y="10" width="3" height="3" fill="white" />
                            <rect x="13" y="10" width="3" height="3" fill="white" />
                            <rect x="8" y="14" width="3" height="3" fill="white" />
                            <rect x="13" y="14" width="3" height="3" fill="white" />
                        </svg>
                    ),
                    bg: 'bg-green-100 dark:bg-green-900',
                    iconColor: 'text-green-600 dark:text-green-400',
                    badge: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                    button: 'bg-green-600 hover:bg-green-700'
                };
            case 'csv':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <path d="M10 13h4M10 17h4M10 9h4" stroke="white" strokeWidth="1.5" fill="none" />
                        </svg>
                    ),
                    bg: 'bg-blue-100 dark:bg-blue-900',
                    iconColor: 'text-blue-600 dark:text-blue-400',
                    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    button: 'bg-blue-600 hover:bg-blue-700'
                };
            case 'pdf':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <text x="7" y="16" fill="white" fontSize="8" fontWeight="bold">PDF</text>
                        </svg>
                    ),
                    bg: 'bg-red-100 dark:bg-red-900',
                    iconColor: 'text-red-600 dark:text-red-400',
                    badge: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    button: 'bg-red-600 hover:bg-red-700'
                };
            case 'json':
                return {
                    icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <text x="7" y="16" fill="white" fontSize="8" fontWeight="bold">{}</text>
                        </svg>
                    ),
                    bg: 'bg-purple-100 dark:bg-purple-900',
                    iconColor: 'text-purple-600 dark:text-purple-400',
                    badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                    button: 'bg-purple-600 hover:bg-purple-700'
                };
        }
    };

    const { icon, bg, iconColor, badge, button } = getIconAndColor();

    const handleExport = () => {
        if (onExport) {
            onExport();
        } else {
            // Default behavior - show alert for now
            alert(`${title} feature coming soon!`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-4 border border-gray-100 dark:border-gray-700">
            {/* Header with Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center ${iconColor}`}>
                    {icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
            </div>

            {/* Preview Lines - Simulating Data Rows */}
            <div className="space-y-2 mb-4 px-1">
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-full" style={{ width: '90%' }} />
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-full" style={{ width: '75%' }} />
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-full" style={{ width: '85%' }} />
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-full" style={{ width: '60%' }} />
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between mb-4">
                <div className={`inline-block ${badge} px-2 py-1 rounded-md text-xs font-medium`}>
                    {fileSize}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {date}
                </span>
            </div>

            {/* Export Button */}
            <button
                onClick={handleExport}
                className={`w-full ${button} text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-sm`}
            >
                Export
            </button>
        </div>
    );
};
