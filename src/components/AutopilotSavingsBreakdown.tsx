import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AutopilotSavingsBreakdown as AutopilotSavingsBreakdownType } from '../types/api';

interface Props {
  data: AutopilotSavingsBreakdownType;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

export default function AutopilotSavingsBreakdown({ data }: Props) {
  // Defensive check: ensure data is an object and has entries
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Autopilot Savings Breakdown
        </h3>
        <div className="p-8 text-center text-gray-500">
          No savings data available
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data)
    .filter(([, value]) => value && typeof value === 'object' && 'savings' in value)
    .map(([reason, { savings }]) => ({
      name: reason,
      savings: typeof savings === 'number' ? savings : 0,
    }));

  // If no valid chart data after filtering, show empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Autopilot Savings Breakdown
        </h3>
        <div className="p-8 text-center text-gray-500">
          No savings data available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Autopilot Savings Breakdown
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value))} stroke="#6b7280" />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Savings"]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="savings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}