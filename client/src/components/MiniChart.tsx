import React from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
    data: number[];
    type?: 'line' | 'bar';
    color?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
    data,
    type = 'line',
    color = '#3B82F6'
}) => {
    // Convert data array to format expected by Recharts
    const chartData = data.map((value, index) => ({
        index,
        value
    }));

    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    // Line chart with dashed style for some variation
    const isDashed = Math.random() > 0.5;

    return (
        <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray={isDashed ? "5 5" : "0"}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};
