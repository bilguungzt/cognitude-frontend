import React from 'react';

interface BestOptimizationCardProps {
  originalModel: string;
  selectedModel: string;
  savingsPerRequest: number;
  totalImpact: number;
  requestCount: number;
}

const BestOptimizationCard: React.FC<BestOptimizationCardProps> = ({
  originalModel,
  selectedModel,
  savingsPerRequest,
  totalImpact,
  requestCount,
}) => {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex flex-col h-full">
      <div>
        <p className="text-sm uppercase tracking-wide text-white/80 mb-1">
          Best Save Today
        </p>
        <h2 className="text-2xl font-bold mb-3">
          Routed {originalModel} → {selectedModel}
        </h2>
        <p className="text-lg">
          Saved <strong>${savingsPerRequest.toFixed(4)}</strong> per request
        </p>
        <p className="text-sm text-white/80">
          Total impact: ${totalImpact.toFixed(2)} ({requestCount} similar
          requests)
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-white/30">
        <a
          href="/autopilot"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-yellow-200 transition"
        >
          Review routing strategy →
        </a>
      </div>
    </div>
  );
};

export default BestOptimizationCard;