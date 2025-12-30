import React, { useState } from 'react';

interface ChartCustomizationProps {
    onCustomizationChange: (customization: ChartCustomization) => void;
}

export interface ChartCustomization {
    colors: string[];
    title: string;
    showLegend: boolean;
    showGrid: boolean;
    animate: boolean;
}

const COLOR_PALETTES = {
    default: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    pastel: ['#B8E0D2', '#D6EADF', '#EAC4D5', '#FFD5CD', '#C5A3FF'],
    corporate: ['#2C3E50', '#3498DB', '#E74C3C', '#F39C12', '#27AE60'],
    ocean: ['#006994', '#0099CC', '#33B5E5', '#66C2E6', '#99D9F0'],
};

export const ChartCustomization: React.FC<ChartCustomizationProps> = ({ onCustomizationChange }) => {
    const [customization, setCustomization] = useState<ChartCustomization>({
        colors: COLOR_PALETTES.default,
        title: 'Data Visualization',
        showLegend: true,
        showGrid: true,
        animate: true,
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (updates: Partial<ChartCustomization>) => {
        const newCustomization = { ...customization, ...updates };
        setCustomization(newCustomization);
        onCustomizationChange(newCustomization);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Customize Chart
                </h3>
                <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Chart Title
                        </label>
                        <input
                            type="text"
                            value={customization.title}
                            onChange={(e) => handleChange({ title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter chart title"
                        />
                    </div>

                    {/* Color Palette */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color Palette
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(COLOR_PALETTES).map(([name, colors]) => (
                                <button
                                    key={name}
                                    onClick={() => handleChange({ colors })}
                                    className={`p-2 rounded-lg border-2 transition-colors ${JSON.stringify(colors) === JSON.stringify(customization.colors)
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-1 mb-1">
                                        {colors.slice(0, 5).map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                        {name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2">
                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Legend</span>
                            <button
                                onClick={() => handleChange({ showLegend: !customization.showLegend })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${customization.showLegend ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${customization.showLegend ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </label>

                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Grid</span>
                            <button
                                onClick={() => handleChange({ showGrid: !customization.showGrid })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${customization.showGrid ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${customization.showGrid ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </label>

                        <label className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Animations</span>
                            <button
                                onClick={() => handleChange({ animate: !customization.animate })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${customization.animate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${customization.animate ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
