import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ChartExport } from '../components/ChartExport';
import { ChartCustomization, ChartCustomization as ChartCustomizationType } from '../components/ChartCustomization';
import { DataFilter } from '../components/DataFilter';

interface Dataset {
    _id: string;
    name: string;
    data: any[];
    columns: string[];
    rowCount: number;
    createdAt: string;
}

export const DatasetView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const chartRef = useRef<HTMLDivElement>(null);

    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
    const [xAxis, setXAxis] = useState<string>('');
    const [yAxis, setYAxis] = useState<string>('');
    const [customization, setCustomization] = useState<ChartCustomizationType>({
        colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
        title: 'Data Visualization',
        showLegend: true,
        showGrid: true,
        animate: true,
    });
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchDataset = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/datasets/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setDataset(response.data);
                setFilteredData(response.data.data);

                // Auto-select first two columns as default axes
                if (response.data.columns.length >= 2) {
                    setXAxis(response.data.columns[0]);
                    setYAxis(response.data.columns[1]);
                }

                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch dataset');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDataset();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !dataset) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Dataset not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const renderChart = () => {
        if (!xAxis || !yAxis) {
            return (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Please select both X and Y axes to display the chart
                </div>
            );
        }

        const chartData = filteredData.map(row => ({
            [xAxis]: row[xAxis],
            [yAxis]: parseFloat(row[yAxis]) || 0
        }));

        const commonProps = {
            margin: { top: 20, right: 30, left: 60, bottom: 60 }
        };

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={450}>
                        <BarChart data={chartData} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey={xAxis}
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 12 }}
                                tickFormatter={(value) => Number(value).toLocaleString()}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value: any) => [Number(value).toLocaleString(), yAxis]}
                                labelFormatter={(label) => `${xAxis}: ${label}`}
                            />
                            {customization.showLegend && <Legend />}
                            <Bar
                                dataKey={yAxis}
                                fill={customization.colors[0]}
                                radius={[6, 6, 0, 0]}
                                animationDuration={customization.animate ? 1000 : 0}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart data={chartData} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey={xAxis}
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 12 }}
                                tickFormatter={(value) => Number(value).toLocaleString()}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value: any) => [Number(value).toLocaleString(), yAxis]}
                                labelFormatter={(label) => `${xAxis}: ${label}`}
                            />
                            {customization.showLegend && <Legend />}
                            <Line
                                type="monotone"
                                dataKey={yAxis}
                                stroke={customization.colors[0]}
                                strokeWidth={3}
                                dot={{ fill: customization.colors[0], strokeWidth: 2, r: 5 }}
                                activeDot={{ r: 7, strokeWidth: 2 }}
                                animationDuration={customization.animate ? 1000 : 0}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey={yAxis}
                                nameKey={xAxis}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label
                                animationDuration={customization.animate ? 1000 : 0}
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={customization.colors[index % customization.colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [Number(value).toLocaleString(), yAxis]}
                            />
                            {customization.showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{dataset.name}</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {filteredData.length} / {dataset.rowCount} rows × {dataset.columns.length} columns
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chart Controls */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {customization.title}
                                </h2>
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    title="Toggle fullscreen"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Chart Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Chart Type
                                    </label>
                                    <select
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="pie">Pie Chart</option>
                                    </select>
                                </div>

                                {/* X Axis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        X Axis
                                    </label>
                                    <select
                                        value={xAxis}
                                        onChange={(e) => setXAxis(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select column...</option>
                                        {dataset.columns.map((col) => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Y Axis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Y Axis
                                    </label>
                                    <select
                                        value={yAxis}
                                        onChange={(e) => setYAxis(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select column...</option>
                                        {dataset.columns.map((col) => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Export Buttons */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <ChartExport
                                    chartRef={chartRef}
                                    data={filteredData}
                                    fileName={dataset.name}
                                />
                            </div>
                        </div>

                        {/* Chart Display */}
                        <div
                            ref={chartRef}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${isFullscreen ? 'fixed inset-4 z-50' : ''
                                }`}
                        >
                            {renderChart()}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <ChartCustomization onCustomizationChange={setCustomization} />
                        <DataFilter
                            data={dataset.data}
                            columns={dataset.columns}
                            onFilterChange={setFilteredData}
                        />
                    </div>
                </div>

                {/* Data Preview */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Data Preview ({filteredData.length} rows)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {dataset.columns.map((col) => (
                                        <th
                                            key={col}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredData.slice(0, 10).map((row, idx) => (
                                    <tr key={idx}>
                                        {dataset.columns.map((col) => (
                                            <td
                                                key={col}
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                                            >
                                                {row[col]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
