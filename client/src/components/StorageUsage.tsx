import React from 'react';
import { ExportPreviewCard } from './ExportPreviewCard';

interface StorageUsageProps {
    used?: number; // in bytes
    total?: number; // in bytes
    onUpgrade?: () => void;
}

export const StorageUsage: React.FC<StorageUsageProps> = () => {
    // Fictional export data for UI display - reduced to 2 cards
    const exportTypes = [
        {
            type: 'excel' as const,
            title: 'Excel Export',
            fileSize: '2.4 MB',
            date: '2 days ago'
        },
        {
            type: 'csv' as const,
            title: 'CSV Export',
            fileSize: '1.2 MB',
            date: '3 days ago'
        }
    ];

    const handleExport = (exportType: string) => {
        alert(`${exportType} feature coming soon!`);
    };

    return (
        <div>
            {/* Export Preview Cards */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Exports</h3>
            <div className="grid grid-cols-1 gap-4">
                {exportTypes.map((exportItem, index) => (
                    <ExportPreviewCard
                        key={index}
                        type={exportItem.type}
                        title={exportItem.title}
                        fileSize={exportItem.fileSize}
                        date={exportItem.date}
                        onExport={() => handleExport(exportItem.title)}
                    />
                ))}
            </div>
        </div>
    );
};
