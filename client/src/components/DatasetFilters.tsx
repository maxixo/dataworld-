import React from 'react';

export type FilterType = 'ALL' | 'CSV' | 'JSON' | 'EXCEL';

interface DatasetFiltersProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export const DatasetFilters: React.FC<DatasetFiltersProps> = ({
    activeFilter,
    onFilterChange
}) => {
    const filters: FilterType[] = ['ALL', 'CSV', 'JSON', 'EXCEL'];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="hidden sm:block text-xl font-bold text-gray-900 dark:text-white">Your Datasets</h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};
