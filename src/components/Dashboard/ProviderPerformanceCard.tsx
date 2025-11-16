import React from "react";

interface ProviderRow {
  name: string;
  requests: number;
  costUsd: number;
  latencyMs: number;
  status: "healthy" | "warning" | "critical";
  isActive: boolean;
}

interface ProviderPerformanceCardProps {
  providers: ProviderRow[];
}

const statusColor: Record<ProviderRow["status"], string> = {
  healthy: "text-emerald-600 bg-emerald-50",
  warning: "text-amber-600 bg-amber-50",
  critical: "text-red-600 bg-red-50",
};

const ProviderPerformanceCard: React.FC<ProviderPerformanceCardProps> = ({
  providers,
}) => {
  const formatStatus = (provider: ProviderRow) => {
    if (!provider.isActive) return "Ready";
    if (provider.status === "healthy") return "Active";
    if (provider.status === "warning") return "Monitoring";
    return "Issue";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Provider Performance
        </h3>
        <a
          href="/providers"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Manage →
        </a>
      </div>
      {providers.length === 0 ? (
        <p className="text-sm text-gray-500">
          Add at least one provider to start routing traffic.
        </p>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{provider.name}</p>
                <p className="text-gray-500">
                  {provider.requests.toLocaleString()} req • $
                  {provider.costUsd.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    provider.isActive
                      ? statusColor[provider.status]
                      : "text-gray-500 bg-gray-100"
                  }`}
                >
                  {provider.isActive ? formatStatus(provider) : "Ready"}
                </span>
                <p className="text-gray-500 text-xs mt-1">
                  {provider.isActive ? `${provider.latencyMs} ms avg` : "Awaiting traffic"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderPerformanceCard;

