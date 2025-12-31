import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiniChart } from './MiniChart';
import { formatFileSize, getRelativeTime, getFileType, getFileTypeColor, generateChartData } from '../utils/formatters';
import { LockedFileViewer } from './LockedFileViewer';

interface DatasetCardProps {
    id: string;
    name: string;
    updatedAt: string;
    fileSize?: number;
    data?: any[];
    onDelete?: () => void;
    isLocked?: boolean;
    label?: string | null;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
    id,
    name,
    updatedAt,
    fileSize = 0,
    data = [],
    onDelete,
    isLocked,
    label
}) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLockedViewer, setShowLockedViewer] = useState(false);

    const fileType = getFileType(name);
    const { bg, icon, badge, chartColor } = getFileTypeColor(fileType);
    const chartData = generateChartData(data);
    const chartType = Math.random() > 0.5 ? 'line' : 'bar';

    const handleCardClick = () => {
        navigate(`/dataset/${id}`);
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        if (onDelete) onDelete();
    };

    // File type icon component
    const FileIcon = () => {
        if (fileType === 'csv') {
            return (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6M10 13h4M10 17h4M10 9h4" stroke="white" strokeWidth="1.5" fill="none" />
                </svg>
            );
        }
        if (fileType === 'json') {
            return (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <text x="8" y="16" fill="white" fontSize="8" fontWeight="bold">{ }</text>
                </svg>
            );
        }
        if (fileType === 'xlsx') {
            return (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <rect x="8" y="10" width="3" height="3" fill="white" />
                    <rect x="13" y="10" width="3" height="3" fill="white" />
                    <rect x="8" y="14" width="3" height="3" fill="white" />
                    <rect x="13" y="14" width="3" height="3" fill="white" />
                </svg>
            );
        }
        return (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
        );
    };

    return (
        <>
        <div
            onClick={handleCardClick}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-5 cursor-pointer relative border border-gray-100 dark:border-gray-700 ${isLocked ? 'opacity-70' : ''}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                {/* File Icon */}
                <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${icon}`}>
                    <FileIcon />
                </div>

                {/* Three Dot Menu */}
                <div className="relative">
                    <button
                        onClick={handleMenuClick}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/dataset/${id}`);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                View
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Delete
                            </button>
                            {isLocked && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowLockedViewer(true); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Decrypt & Download
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dataset Info */}
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {name.replace(/\.(csv|json|xlsx|txt)$/i, '')}
                </h3>
                {isLocked && (
                    <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 17a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z" />
                            <rect x="5" y="8" width="14" height="10" rx="2" />
                            <path d="M8 8V7a4 4 0 018 0v1" />
                        </svg>
                        Locked
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Updated {getRelativeTime(updatedAt)}
            </p>

            {/* Mini Chart */}
            {chartData.length > 0 && (
                <div className="mb-4">
                    <MiniChart
                        data={chartData}
                        type={chartType}
                        color={chartColor}
                    />
                </div>
            )}

            {/* File Size Badge */}
            <div className={`inline-block ${badge} px-3 py-1 rounded-md`}>
                <span className={`text-xs font-medium ${icon}`}>
                    {formatFileSize(fileSize)}
                </span>
            </div>
        </div>
        {showLockedViewer && (
            <LockedFileViewer id={id} label={label} onClose={() => setShowLockedViewer(false)} />
        )}
        </>
    );
};
