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

const buildProjection = () =>
  placeholderData.map((point, idx) => ({
    ...point,
    cumulativeSavings: Math.round(
      (point.cumulativeSavings || 100) * (1 + idx * 0.2)
    ),
  }));

const SavingsChart: React.FC<Partial<SavingsChartProps>> = ({
  data = placeholderData,
}) => {
  const hasData = data.some((point) => point.cumulativeSavings > 0);
  const projectionData = buildProjection();

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
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                Projected savings based on your current configuration.
              </p>
              <span className="text-xs font-semibold text-indigo-600">
                Demo mode
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="projectionSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #ccc",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSavings"
                  stroke="#6366F1"
                  fillOpacity={1}
                  fill="url(#projectionSavings)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="mt-4 text-sm text-gray-600 text-center">
              With smart routing enabled, teams like yours typically save about
              $1,200/month after 1,000 GPT-4 requests.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsChart;