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
    <div className="p-6 rounded-lg shadow-lg bg-gradient-to-br from-green-400 to-blue-500 text-white">
      <h2 className="text-2xl font-bold mb-2">🏆 Best Save Today</h2>
      <p className="text-lg mb-4">
        Routed {originalModel} → {selectedModel}
      </p>
      <div className="text-right">
        <p className="text-xl font-semibold">
          Saved: ${savingsPerRequest.toFixed(4)} per request
        </p>
        <p className="text-md">
          Total impact: ${totalImpact.toFixed(2)} ({requestCount} similar requests)
        </p>
      </div>
    </div>
  );
};

export default BestOptimizationCard;