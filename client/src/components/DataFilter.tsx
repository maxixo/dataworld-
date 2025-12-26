import React, { useState } from 'react';

interface DataFilterProps {
    data: any[];
    columns: string[];
    onFilterChange: (filteredData: any[]) => void;
}

export const DataFilter: React.FC<DataFilterProps> = ({ data, columns, onFilterChange }) => {
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const getColumnType = (column: string): 'number' | 'string' | 'date' => {
        const sample = data[0]?.[column];
        if (typeof sample === 'number' || !isNaN(Number(sample))) return 'number';
        if (new Date(sample).toString() !== 'Invalid Date') return 'date';
        return 'string';
    };

    const getUniqueValues = (column: string) => {
        const values = [...new Set(data.map(row => row[column]))];
        return values.filter(v => v != null).sort();
    };

    const applyFilters = (newFilters: Record<string, any>, search: string) => {
        let filtered = data;

        // Apply column filters
        Object.entries(newFilters).forEach(([column, filterValue]) => {
            if (!filterValue) return;

            const colType = getColumnType(column);

            if (colType === 'number' && filterValue.min !== undefined && filterValue.max !== undefined) {
                filtered = filtered.filter(row => {
                    const value = Number(row[column]);
                    return value >= filterValue.min && value <= filterValue.max;
                });
            } else if (Array.isArray(filterValue) && filterValue.length > 0) {
                filtered = filtered.filter(row => filterValue.includes(row[column]));
            }
        });

        // Apply search
        if (search) {
            filtered = filtered.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(search.toLowerCase())
                )
            );
        }

        onFilterChange(filtered);
    };

    const handleFilterChange = (column: string, value: any) => {
        const newFilters = { ...filters, [column]: value };
        setFilters(newFilters);
        applyFilters(newFilters, searchTerm);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        applyFilters(filters, value);
    };

    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
        onFilterChange(data);
    };

    const activeFilterCount = Object.values(filters).filter(v => v != null && (Array.isArray(v) ? v.length > 0 : true)).length + (searchTerm ? 1 : 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter Data
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </h3>
                <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {/* Global Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Search All Columns
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Column Filters */}
                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {columns.slice(0, 5).map(column => {
                            const colType = getColumnType(column);

                            if (colType === 'number') {
                                const values = data.map(row => Number(row[column])).filter(v => !isNaN(v));
                                const min = Math.min(...values);
                                const max = Math.max(...values);

                                return (
                                    <div key={column} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {column}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters[column]?.min ?? ''}
                                                onChange={(e) => handleFilterChange(column, {
                                                    min: e.target.value ? Number(e.target.value) : min,
                                                    max: filters[column]?.max ?? max
                                                })}
                                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters[column]?.max ?? ''}
                                                onChange={(e) => handleFilterChange(column, {
                                                    min: filters[column]?.min ?? min,
                                                    max: e.target.value ? Number(e.target.value) : max
                                                })}
                                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            const uniqueValues = getUniqueValues(column);
                            if (uniqueValues.length > 20) return null; // Skip columns with too many unique values

                            return (
                                <div key={column} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {column}
                                    </label>
                                    <select
                                        multiple
                                        value={filters[column] || []}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            handleFilterChange(column, selected.length > 0 ? selected : null);
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white max-h-32"
                                        size={Math.min(uniqueValues.length, 5)}
                                    >
                                        {uniqueValues.map(value => (
                                            <option key={String(value)} value={String(value)}>
                                                {String(value)}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Hold Ctrl/Cmd to select multiple
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
