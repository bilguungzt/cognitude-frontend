import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { CheckCircle2, Zap, Bell, BookOpen } from "lucide-react";

interface ProviderStatus {
  name: string;
  status: "healthy" | "warning" | "critical";
  latencyMs: number;
  isActive: boolean;
}

interface DashboardHeroProps {
  heroStats: {
    couldHaveSpent: number;
    actuallySpent: number;
    totalSavings: number;
    projectedMonthlySavings: number;
    showEmptyState: boolean;
  };
  systemStatus: {
    overall: "healthy" | "warning" | "critical";
    message: string;
    providers: ProviderStatus[];
  };
  requestStats: {
    totalRequests: number;
    cacheHitRate: number;
    daysSinceSetup: number;
  };
  quickActions: {
    label: string;
    description: string;
    href: string;
  }[];
}

const AnimatedCurrency = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(latest);
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const statusStyles = {
  healthy: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  warning: {
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot: "bg-yellow-500",
  },
  critical: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
};

const quickActionIcons = [Zap, Bell, BookOpen];

const DashboardHero = ({
  heroStats,
  systemStatus,
  requestStats,
  quickActions,
}: DashboardHeroProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg">
          <div className="relative z-10">
            <p className="uppercase tracking-wide text-sm text-white/80">
              Total Savings This Month
            </p>
            <div className="mt-3 text-5xl font-extrabold tracking-tight">
              {heroStats.showEmptyState ? (
                <span>Ready to start saving</span>
              ) : (
                <AnimatedCurrency value={heroStats.totalSavings} />
              )}
            </div>
            <p className="mt-2 text-white/80">
              Projected monthly savings:{" "}
              <strong>{formatCurrency(heroStats.projectedMonthlySavings)}</strong>
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/70 border-t border-white/20 pt-4">
              <div>
                <p className="text-xs uppercase tracking-wide">
                  Could have spent
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(heroStats.couldHaveSpent)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">
                  Actually spent
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(heroStats.actuallySpent)}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-xl" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">System Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {systemStatus.message}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                statusStyles[systemStatus.overall].badge
              }`}
            >
              {systemStatus.overall === "healthy"
                ? "All systems go"
                : systemStatus.overall === "warning"
                ? "Needs attention"
                : "Action required"}
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {systemStatus.providers.map((provider) => (
              <li key={provider.name} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{provider.name}</span>
                <span className="flex items-center gap-2 text-gray-600">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      statusStyles[provider.status].dot
                    }`}
                  />
                  {provider.isActive
                    ? provider.status === "healthy"
                      ? `${provider.latencyMs} ms`
                      : "Degraded"
                    : "Waiting for traffic"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Last 24 hours</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {requestStats.totalRequests.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total requests proxied</p>
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Cache hit rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {requestStats.cacheHitRate}%{" "}
                <span className="text-xs text-emerald-600">(+deterministic)</span>
              </p>
            </div>
            <div>
              <p className="text-gray-500">Days since setup</p>
              <p className="text-xl font-semibold text-gray-900">
                {requestStats.daysSinceSetup}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {quickActions.map((action, index) => {
          const Icon = quickActionIcons[index] ?? CheckCircle2;
          return (
            <a
              key={action.label}
              href={action.href}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white/80 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{action.label}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHero;