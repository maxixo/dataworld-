// Utility functions for formatting data

/**
 * Format file size from bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Format as date for older items
    return past.toLocaleDateString();
};

/**
 * Detect file type from filename
 */
export const getFileType = (filename: string): 'csv' | 'json' | 'xlsx' | 'txt' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'csv': return 'csv';
        case 'json': return 'json';
        case 'xlsx':
        case 'xls': return 'xlsx';
        default: return 'txt';
    }
};

/**
 * Get color scheme for file type
 */
export const getFileTypeColor = (fileType: 'csv' | 'json' | 'xlsx' | 'txt') => {
    const colors = {
        csv: {
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            icon: 'text-blue-600 dark:text-blue-400',
            badge: 'bg-blue-50 dark:bg-blue-900/30',
            chartColor: '#3B82F6'
        },
        json: {
            bg: 'bg-cyan-100 dark:bg-cyan-900/20',
            icon: 'text-cyan-600 dark:text-cyan-400',
            badge: 'bg-cyan-50 dark:bg-cyan-900/30',
            chartColor: '#06B6D4'
        },
        xlsx: {
            bg: 'bg-green-100 dark:bg-green-900/20',
            icon: 'text-green-600 dark:text-green-400',
            badge: 'bg-green-50 dark:bg-green-900/30',
            chartColor: '#10B981'
        },
        txt: {
            bg: 'bg-purple-100 dark:bg-purple-900/20',
            icon: 'text-purple-600 dark:text-purple-400',
            badge: 'bg-purple-50 dark:bg-purple-900/30',
            chartColor: '#8B5CF6'
        }
    };

    return colors[fileType];
};

/**
 * Generate sample chart data from dataset
 */
export const generateChartData = (data: any[], maxPoints: number = 12): number[] => {
    if (!data || data.length === 0) return [];

    // Get numeric values from first numeric column
    const numericValues: number[] = [];

    for (const row of data) {
        for (const key in row) {
            const value = parseFloat(row[key]);
            if (!isNaN(value)) {
                numericValues.push(value);
                break;
            }
        }
        if (numericValues.length >= maxPoints) break;
    }

    // If no numeric data, generate random data for visualization
    if (numericValues.length === 0) {
        return Array.from({ length: maxPoints }, () => Math.floor(Math.random() * 100));
    }

    return numericValues.slice(0, maxPoints);
};

/**
 * Calculate storage percentage
 */
export const calculateStoragePercentage = (used: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
};
