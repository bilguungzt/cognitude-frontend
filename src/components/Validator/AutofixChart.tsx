import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AutofixChartProps {
  data: {
    retries: {
      [key: string]: number;
    };
    average_retries: number;
  };
}

const AutofixChart: React.FC<AutofixChartProps> = ({ data }) => {
  const chartData = Object.entries(data.retries).map(([name, value]) => ({ name: `${name} Retries`, value }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8B5CF6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AutofixChart;