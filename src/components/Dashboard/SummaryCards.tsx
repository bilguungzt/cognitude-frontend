import { DollarSign, ShieldCheck, Bot } from "lucide-react";
import type {
  AutopilotSavings,
  ValidationStats,
  SchemaStat,
} from "../../types/api";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  footer: string;
  color: "green" | "blue" | "purple";
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  footer,
  color,
}) => {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500">{footer}</p>
      </div>
    </div>
  );
};

export const AutopilotSavingsSummaryCard: React.FC<{
  data: AutopilotSavings | null;
}> = ({ data }) => {
  const savings = data?.cost_savings || 0;
  return (
    <SummaryCard
      icon={<Bot className="w-6 h-6" />}
      title="Autopilot Savings"
      value={`$${savings.toFixed(2)}`}
      footer="Total savings from Autopilot"
      color="purple"
    />
  );
};

export const ResponseValidationHealthMetrics: React.FC<{
  data: ValidationStats | null;
}> = ({ data }) => {
  const successRate = data?.success_rate || 0;
  return (
    <SummaryCard
      icon={<ShieldCheck className="w-6 h-6" />}
      title="Validation Health"
      value={`${(successRate * 100).toFixed(1)}%`}
      footer="Overall success rate"
      color="blue"
    />
  );
};

export const SchemaEnforcementStatistics: React.FC<{
  data: SchemaStat[] | null;
}> = ({ data }) => {
  const totalSchemas = data?.length || 0;
  return (
    <SummaryCard
      icon={<DollarSign className="w-6 h-6" />}
      title="Schema Enforcement"
      value={totalSchemas.toLocaleString()}
      footer="Total active schemas"
      color="green"
    />
  );
};