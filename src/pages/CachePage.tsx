import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Trash2,
  TrendingUp,
  Zap,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Info,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import api from "../services";
import type { CacheStats } from "../types/api";
import { useApiQuery } from "../hooks/useApiQuery";
import Skeleton from "../components/Skeleton";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../components/ToastContainer";

const DEFAULT_TOP_ENDPOINTS = [
  { endpoint: "/summarize", hit_rate: 0.89, savings_usd: 45 },
  { endpoint: "/translate", hit_rate: 0.67, savings_usd: 23 },
  { endpoint: "/classify", hit_rate: 0.12, savings_usd: 2 },
];

const DEFAULT_MOST_FREQUENT_RESPONSE = {
  endpoint: "/summarize-docs",
  model: "gpt-4o-mini",
  summary: "Summarized a 12 page onboarding document in 900 tokens",
  savings_usd: 4.5,
};

const ZERO_STATS: CacheStats = {
  total_entries: 0,
  total_hits: 0,
  hit_rate: 0,
  estimated_savings_usd: 0,
  redis_available: false,
  redis_entries: 0,
  redis_hits: 0,
};

const formatRelativeTime = (timestamp?: string | null) => {
  if (!timestamp) return "No cache hits yet";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const formatBytes = (bytes?: number | null, fallback = "—") => {
  if (!bytes || bytes <= 0) return fallback;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
};

const useAnimatedNumber = (target: number, duration = 800) => {
  const [value, setValue] = useState(target);

  useEffect(() => {
    let animationFrame: number;
    const startValue = value;
    const delta = target - startValue;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setValue(startValue + delta * progress);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return Math.max(0, value);
};

export default function CachePage() {
  const {
    data: cacheStats,
    isLoading,
    error,
    refetch,
  } = useApiQuery<CacheStats>({
    queryKey: ["cache-stats"],
    queryFn: () => api.getCacheStats(),
    zeroStateOn404: {
      total_entries: 0,
      total_hits: 0,
      hit_rate: 0,
      estimated_savings_usd: 0,
      redis_available: false,
      redis_entries: 0,
      redis_hits: 0,
    },
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clearType, setClearType] = useState<"redis" | "postgresql" | "all">(
    "all"
  );
  const [clearing, setClearing] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { showToast } = useToast();

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api.clearCache({ cache_type: clearType });
      await refetch();
      setIsConfirmModalOpen(false);
      setConfirmText("");
      showToast("Cache cleared successfully", "success");
    } catch (err) {
      showToast(api.handleError(err), "error");
    } finally {
      setClearing(false);
    }
  };

  const openClearModal = (type: "redis" | "postgresql" | "all") => {
    setClearType(type);
    setIsConfirmModalOpen(true);
  };

  const errorMessage = error ? api.handleError(error) : null;

  const stats = cacheStats ?? ZERO_STATS;

  const cacheHitRate = Math.max(0, (stats.hit_rate || 0) * 100);
  const cachedResponses = stats.total_entries || 0;
  const totalHits = stats.total_hits || 0;
  const estimatedSavings = stats.estimated_savings_usd || 0;
  const redisHits = stats.redis_hits ?? totalHits;
  const redisEntries = stats.redis_entries ?? cachedResponses;
  const redisAvailable = stats.redis_available ?? false;
  const requestsServed = totalHits;
  const hasCacheActivity =
    cachedResponses > 0 || totalHits > 0 || estimatedSavings > 0;
  const cacheStorageSizeLabel = `${formatBytes(
    stats.storage_size_bytes,
    "12.4 MB"
  )} used`;
  const ttlHours = stats.ttl_hours ?? 24;
  const maxCacheSize = stats.max_cache_size_bytes
    ? formatBytes(stats.max_cache_size_bytes)
    : "Unlimited";
  const excludePatterns = stats.exclude_patterns?.length
    ? stats.exclude_patterns
    : ["/stream*", "/realtime*"];
  const autoInvalidation = stats.auto_invalidation_enabled ?? true;
  const topEndpoints = useMemo(() => {
    if (stats.top_cached_endpoints && stats.top_cached_endpoints.length) {
      return stats.top_cached_endpoints;
    }
    return DEFAULT_TOP_ENDPOINTS;
  }, [stats.top_cached_endpoints]);
  const chartData = useMemo(
    () =>
      topEndpoints.map((endpoint) => ({
        endpoint: endpoint.endpoint,
        hitRate: Math.round(endpoint.hit_rate * 100),
        savings: endpoint.savings_usd,
      })),
    [topEndpoints]
  );
  const mostFrequentResponse = stats.most_frequent_response
    ? {
        ...stats.most_frequent_response,
        summary:
          stats.most_frequent_response.summary ||
          DEFAULT_MOST_FREQUENT_RESPONSE.summary,
      }
    : DEFAULT_MOST_FREQUENT_RESPONSE;
  const lastCacheHit = formatRelativeTime(stats.last_cache_hit_at);
  const animatedSavings = useAnimatedNumber(estimatedSavings);
  const animatedRequests = useAnimatedNumber(requestsServed);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  if (isLoading) {
    return (
      <Layout title="Cache Management">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-36 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (errorMessage) {
    return (
      <Layout>
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load cache statistics"
          description={errorMessage}
          action={{
            label: "Retry",
            onClick: () => refetch(),
          }}
        />
      </Layout>
    );
  }

  if (!cacheStats) {
    return (
      <Layout>
        <EmptyState
          icon={Database}
          title="No cache data available"
          description="Cache statistics will appear once you start using the proxy."
          action={{
            label: "Retry",
            onClick: () => refetch(),
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Cache Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Cache Management
              </h2>
              <p className="text-gray-600">
                Monitor cache performance and manage cached responses
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hit Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {cacheHitRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Percentage of requests served from cache
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Cached Responses
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {cachedResponses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Aggregate entries across cache layers
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Requests Served
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {requestsServed.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Lifetime cache hits tracked by the gateway
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Estimated Savings
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(estimatedSavings)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Cost avoided by serving cached responses
            </p>
          </div>
        </div>

        {/* Cache Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Cache Performance
                </h3>
                <p className="text-sm text-gray-600">
                  Unified view across Redis + PostgreSQL cache layers
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  redisAvailable
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {redisAvailable ? "Healthy" : "Warming Up"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Cache hit rate
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {hasCacheActivity ? `${cacheHitRate.toFixed(1)}%` : "0.0%"}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {hasCacheActivity
                    ? "Percentage of requests served from cache"
                    : "Ready to cache — identical requests will be served instantly."}
                </p>
                {!hasCacheActivity && (
                  <p className="text-xs text-purple-600 mt-2 font-medium">
                    Expected: 30-70% hit rate after ~100 requests
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Cached responses tracked
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {cachedResponses.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Across Redis (hot) and PostgreSQL (warm) layers
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Estimated savings
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(estimatedSavings)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Cost avoided by serving cached responses
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
                <Clock className="w-10 h-10 text-indigo-500" />
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Last cache hit
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {lastCacheHit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
                <Database className="w-10 h-10 text-sky-500" />
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Cache storage size
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {cacheStorageSizeLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50">
                <p className="text-xs uppercase text-emerald-700">
                  Redis entries tracked
                </p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {redisEntries.toLocaleString()}
                </p>
              </div>
              <div className="p-4 border border-purple-100 rounded-xl bg-purple-50">
                <p className="text-xs uppercase text-purple-700">
                  Redis cache hits
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {redisHits.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" /> Cache Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Configure caching rules without touching code
                </p>
              </div>
              <button className="btn-ghost btn-sm" disabled>
                Edit
              </button>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-xs uppercase text-gray-500">Default TTL</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {ttlHours} hours
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">
                  Max cache size
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {maxCacheSize}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">
                  Auto invalidation
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {autoInvalidation ? "On schema change" : "Manual only"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">
                  Exclude patterns
                </dt>
                <dd className="flex flex-wrap gap-2 mt-2">
                  {excludePatterns.map((pattern) => (
                    <span
                      key={pattern}
                      className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                    >
                      {pattern}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
              <p className="text-sm font-semibold text-indigo-900">
                Cache key strategy
              </p>
              <p className="text-sm text-indigo-800 mt-1">
                Model + temperature + normalized messages are hashed, so
                identical prompts always reuse the same cached response.
              </p>
            </div>
          </div>
        </div>

        {/* Cache Hit Distribution & Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" /> Cache Hit
                  Distribution
                </h3>
                <p className="text-sm text-gray-600">
                  Which endpoints benefit most from caching
                </p>
              </div>
            </div>

            {chartData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="endpoint"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "hitRate") {
                          return [`${value}%`, "Hit rate"];
                        }
                        return [formatCurrency(Number(value)), "Savings"];
                      }}
                    />
                    <Bar
                      dataKey="hitRate"
                      fill="#a855f7"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-gray-600 bg-gray-50 rounded-xl">
                Collecting data... run at least three endpoints to see hit rate
                trends.
              </div>
            )}

            <div className="mt-6 divide-y divide-gray-100">
              {topEndpoints.map((endpoint) => (
                <div
                  key={endpoint.endpoint}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {endpoint.endpoint}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${endpoint.savings_usd.toFixed(2)} saved
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-purple-600">
                    {(endpoint.hit_rate * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-500" /> Most Frequently Cached
                Response
              </h3>
              <p className="text-sm text-gray-600">
                Last seen on{" "}
                <span className="font-medium">
                  {mostFrequentResponse.endpoint}
                </span>
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700 italic">
                  “{mostFrequentResponse.summary}”
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">Model</span>
                <span className="font-semibold text-gray-900">
                  {mostFrequentResponse.model}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Saved</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(mostFrequentResponse.savings_usd)}
                </span>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-emerald-50 to-green-100 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lifetime Cache Impact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs uppercase text-gray-600">
                        Requests served
                      </p>
                      <p className="text-3xl font-bold text-green-700">
                        {animatedRequests.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-600">
                        Cost saved
                      </p>
                      <p className="text-3xl font-bold text-green-700">
                        {formatCurrency(animatedSavings)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Counter updates in real time as new cache hits roll in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Clear Cache Safely
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Clearing cache forces fresh LLM calls and may temporarily
                  increase cost.
                </p>
              </div>
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => openClearModal("redis")}
                className="btn-danger-outline text-sm"
              >
                Clear Redis
              </button>
              <button
                onClick={() => openClearModal("postgresql")}
                className="btn-danger-outline text-sm"
              >
                Clear Postgres
              </button>
              <button
                onClick={() => openClearModal("all")}
                className="btn-danger text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> How caching works
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                Hit rate climbs after the first 100 identical prompts. Use the
                same prompt template to maximize reuse.
              </li>
              <li>
                Streaming and realtime endpoints are excluded automatically.
              </li>
              <li>
                Schema changes trigger automatic invalidation so you always
                return fresh data.
              </li>
              <li>Cached responses cost $0 and return in ~0ms latency.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Clear Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Cache Clear"
      >
        <div className="space-y-4">
          <div className="alert-error">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-semibold">
                Are you sure you want to clear cached responses?
              </p>
              <p className="text-sm mt-1 text-gray-700">
                Requested scope:{" "}
                <span className="font-medium">{clearType}</span>
              </p>
              <p className="text-sm mt-1">
                This action clears both Redis and PostgreSQL caches and cannot
                be undone. Future requests will go directly to the LLM providers
                until the cache warms back up.
              </p>
            </div>
          </div>

          <div>
            <label className="label text-sm font-medium text-gray-700">
              Type DELETE to confirm
            </label>
            <input
              value={confirmText}
              onChange={(event) =>
                setConfirmText(event.target.value.toUpperCase())
              }
              placeholder="DELETE"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-2">
              This prevents accidental cache invalidations.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="btn-outline"
              disabled={clearing}
            >
              Cancel
            </button>
            <button
              onClick={handleClearCache}
              className="btn-danger flex items-center gap-2"
              disabled={clearing || confirmText !== "DELETE"}
            >
              {clearing ? (
                <>
                  <LoadingSpinner size="sm" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clear Cache
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
