import React, { useState } from 'react';
import { FaBrain, FaSpinner } from 'react-icons/fa';

interface AIInsightsProps {
    data: any[];
    columns: string[];
    chartType: string;
    xAxis: string;
    yAxis: string;
    onInsightsGenerated: (insights: string) => void;
}

interface InsightData {
    success: boolean;
    insights: string;
    statistics: Record<string, any>;
    message?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
    data,
    columns,
    chartType,
    xAxis,
    yAxis,
    onInsightsGenerated
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInsights, setShowInsights] = useState(false);
    const [insights, setInsights] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<Record<string, any> | null>(null);

    const generateInsights = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/ai/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data,
                    columns,
                    chartType,
                    xAxis,
                    yAxis
                })
            });

            const result: InsightData = await response.json();

            if (response.ok && result.success) {
                setInsights(result.insights);
                setStatistics(result.statistics);
                setShowInsights(true);
                onInsightsGenerated(result.insights);
            } else {
                setError(result.message || 'Failed to generate insights');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating insights');
        } finally {
            setLoading(false);
        }
    };

    const formatInsights = (text: string) => {
        // Convert markdown-like formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• /g, '• ')
            .replace(/\n\n/g, '<br /><br />')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FaBrain className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI-Powered Insights
                    </h2>
                </div>
                <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <FaBrain className="w-4 h-4" />
                            <span>Generate Insights</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    {error.includes('API key') && (
                        <p className="text-red-600 dark:text-red-500 text-xs mt-2">
                            Note: To use AI insights, add your Zhipu AI API key to the server's .env file as ZAI_API_KEY
                        </p>
                    )}
                </div>
            )}

            {showInsights && insights && (
                <div className="space-y-4">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                            Analysis & Insights
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div 
                                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatInsights(insights) }}
                            />
                        </div>
                    </div>

                    {statistics && Object.keys(statistics).length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                                Statistical Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(statistics).map(([column, stats]: [string, any]) => (
                                    <div 
                                        key={column}
                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                                    >
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                            {column}
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Average:</span>
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {stats.average}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Min:</span>
                                                <span className="text-gray-900 dark:text-white">{stats.min}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Max:</span>
                                                <span className="text-gray-900 dark:text-white">{stats.max}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Sum:</span>
                                                <span className="text-gray-900 dark:text-white">{stats.sum}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Count:</span>
                                                <span className="text-gray-900 dark:text-white">{stats.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setShowInsights(false)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
                    >
                        Hide insights
                    </button>
                </div>
            )}

            {!showInsights && !loading && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click "Generate Insights" to get AI-powered analysis of your data, including key findings, trends, and recommendations.
                </p>
            )}
        </div>
    );
};
