import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';

interface SavingsData {
  date: string;
  cumulativeSavings: number;
}

interface SavingsChartProps {
  data: SavingsData[];
}

// Placeholder data for demonstration purposes
const placeholderData: SavingsData[] = [
  { date: 'Jan', cumulativeSavings: 100 },
  { date: 'Feb', cumulativeSavings: 250 },
  { date: 'Mar', cumulativeSavings: 400 },
  { date: 'Apr', cumulativeSavings: 500 },
  { date: 'May', cumulativeSavings: 700 },
  { date: 'Jun', cumulativeSavings: 950 },
];

const SavingsChart: React.FC<Partial<SavingsChartProps>> = ({
  data = placeholderData,
}) => {
  const hasData = data.some((point) => point.cumulativeSavings > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  border: "1px solid #ccc",
                }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Area
                type="monotone"
                dataKey="cumulativeSavings"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorSavings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
            <p className="text-sm">
              Start routing requests through Cognitude to unlock live savings
              analytics.
            </p>
            <a
              href="/setup"
              className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View quickstart →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsChart;