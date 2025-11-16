import React from "react";

interface RoutingWin {
  originalModel: string;
  selectedModel: string;
  savingsPerRequest: number;
  totalImpact: number;
  timestamp: string;
}

interface SmartRoutingWinsProps {
  wins: RoutingWin[];
}

const formatCurrency = (value: number) =>
  `$${value.toFixed(value >= 1 ? 2 : 4)}`;

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const SmartRoutingWins: React.FC<SmartRoutingWinsProps> = ({ wins }) => {
  if (!wins.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Smart Routing Wins
        </h3>
        <p className="text-sm text-gray-500">
          Connect a second provider to start capturing automatic savings.
        </p>
        <a
          href="/autopilot"
          className="mt-4 inline-block text-sm font-semibold text-indigo-600"
        >
          Enable Smart Routing →
        </a>
      </div>
    );
  }

  const [topWin, ...otherWins] = wins;
  const estimatedSpend = topWin.totalImpact + 150.5;
  const savingsPercent = (topWin.totalImpact / estimatedSpend) * 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-500/90 to-sky-500/90 text-white p-6 shadow-sm flex flex-col h-full">
      <div>
        <p className="text-sm uppercase tracking-wide text-white/90">
          Best Save Today
        </p>
        <h3 className="text-3xl font-bold mt-2">
          {topWin.originalModel} → {topWin.selectedModel}
        </h3>
        <p className="text-lg mt-2">
          Saved{" "}
          <span className="font-semibold">
            {formatCurrency(topWin.savingsPerRequest)}
          </span>{" "}
          per request
        </p>
        <p className="text-sm text-white/90">
          Total impact: {formatCurrency(topWin.totalImpact)} today
        </p>
      </div>
      <p className="text-sm text-white mt-4">
        💡 Without smart routing you’d have spent {formatCurrency(estimatedSpend)}.
        Your savings: {savingsPercent.toFixed(1)}%.
      </p>
      {otherWins.length > 0 && (
        <div className="mt-6 bg-white/10 rounded-xl p-4 flex-1">
          <p className="text-sm font-semibold mb-2 text-white">
            Recent smart routes
          </p>
          <ul className="space-y-2 text-sm">
            {otherWins.slice(0, 3).map((win, idx) => (
              <li
                key={`${win.originalModel}-${win.selectedModel}-${idx}`}
                className="flex items-center justify-between text-white/90"
              >
                <div>
                  <span className="font-medium">
                    {win.originalModel} → {win.selectedModel}
                  </span>
                  <span className="ml-2 text-white/70">
                    {formatCurrency(win.savingsPerRequest)} / req
                  </span>
                </div>
                <span className="text-white/70">{formatTime(win.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <a
        href="/autopilot"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-yellow-200"
      >
        Review routing strategy →
      </a>
    </div>
  );
};

export default SmartRoutingWins;

