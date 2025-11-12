import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RetryAttemptsChartProps {
  data: {
    [key: string]: number;
  };
}

const RetryAttemptsChart: React.FC<RetryAttemptsChartProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name: `${name} Retries`, value }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#4F46E5" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RetryAttemptsChart;