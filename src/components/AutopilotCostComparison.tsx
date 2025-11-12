import type { AutopilotCostComparison as AutopilotCostComparisonType } from '../types/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  data: AutopilotCostComparisonType;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

export default function AutopilotCostComparison({ data }: Props) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Autopilot Cost Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Could Have Spent
          </p>
          <p className="text-3xl font-bold text-gray-500 line-through">
            {formatCurrency(data.could_have_spent)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Actually Spent
          </p>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(data.actually_spent)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Savings
          </p>
          <div className="flex items-center justify-center">
            <p className="text-3xl font-bold text-success-600 mr-2">
              {formatCurrency(data.savings)}
            </p>
            {data.savings > 0 ? (
              <TrendingDown className="w-6 h-6 text-success-600" />
            ) : (
              <TrendingUp className="w-6 h-6 text-danger-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}