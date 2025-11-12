import React from 'react';
import { TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import type { AutopilotDashboardData } from '../../types/api';

interface HeroStatsProps {
  stats: AutopilotDashboardData['heroStats'];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

const calculateSavingsPercentage = (couldHaveSpent: number, actuallySpent: number) => {
  if (couldHaveSpent === 0) return 0;
  return ((couldHaveSpent - actuallySpent) / couldHaveSpent) * 100;
};

const CostEfficiencyScore: React.FC<{ percentage: number }> = ({ percentage }) => {
  const width = `${Math.min(percentage, 100)}%`;
  const getBarColor = () => {
    if (percentage >= 70) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (percentage >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-orange-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div 
        className={`h-full ${getBarColor()} transition-all duration-1000 ease-out`}
        style={{ width }}
      />
    </div>
  );
};

export default function HeroStats({ stats }: HeroStatsProps) {
  const savingsPercentage = calculateSavingsPercentage(stats.couldHaveSpent, stats.actuallySpent);
  const savingsAmount = stats.couldHaveSpent - stats.actuallySpent;

  return (
    <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border-0 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Could Have Spent Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">YOU COULD HAVE SPENT</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.couldHaveSpent)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Without Autopilot optimization</p>
        </div>

        {/* Actually Spent Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">YOU ACTUALLY SPENT</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.actuallySpent)}
          </p>
          <p className="text-xs text-gray-500 mt-1">With Autopilot optimization</p>
        </div>

        {/* Savings Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-success-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">AUTOPILOT SAVED YOU</h3>
          </div>
          <p className="text-2xl font-bold text-success-600">
            {formatCurrency(savingsAmount)}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            ({savingsPercentage.toFixed(1)}% reduction)
          </p>
        </div>

        {/* Cost Efficiency Score Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">COST EFFICIENCY</h3>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gray-900">{savingsPercentage.toFixed(1)}%</p>
          </div>
          <div className="mt-2">
            <CostEfficiencyScore percentage={savingsPercentage} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Efficiency score based on cost reduction</p>
        </div>
      </div>
    </div>
  );
}