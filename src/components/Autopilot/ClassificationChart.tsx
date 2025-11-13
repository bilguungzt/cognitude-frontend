import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AutopilotClassificationBreakdown } from '../../types/api';

interface Props {
  data: AutopilotClassificationBreakdown;
}

// Color palette for the donut chart
const COLORS = [
 '#4f46e5', // indigo-600
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
];

const formatPercentage = (value: number) => {
  return `${value}%`;
};

export default function ClassificationChart({ data }: Props) {
  // Convert the data object to an array format suitable for recharts
  const chartData = Object.entries(data).map(([classification, percentage]) => ({
    name: classification,
    value: percentage,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Classification Breakdown
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatPercentage(Number(value)), "Percentage"]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}