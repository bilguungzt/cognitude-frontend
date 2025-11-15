import { useState } from "react";
import { AxiosError } from "axios";
import {
  Database,
  Trash2,
  TrendingUp,
  Zap,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import api from "../services";
import type { CacheStats } from "../types/api";
import { useApiQuery } from "../hooks/useApiQuery";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/ToastContainer";

export default function CachePage() {
  const {
    data: cacheStats,
    isLoading,
    error,
    refetch,
  } = useApiQuery<CacheStats>(["cache-stats"], async () => {
    try {
      return await api.getCacheStats();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        return {
          total_entries: 0,
          total_hits: 0,
          hit_rate: 0,
          estimated_savings_usd: 0,
          redis_available: false,
          redis_entries: 0,
          redis_hits: 0,
        };
      }
      throw err;
    }
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clearType, setClearType] = useState<"redis" | "postgresql" | "all">(
    "all"
  );
  const [clearing, setClearing] = useState(false);
  const { showToast } = useToast();

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api.clearCache();
      await refetch();
      setIsConfirmModalOpen(false);
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

  const cacheHitRate = Math.max(0, (cacheStats.hit_rate || 0) * 100);
  const cachedResponses = cacheStats.total_entries || 0;
  const totalHits = cacheStats.total_hits || 0;
  const estimatedSavings = cacheStats.estimated_savings_usd || 0;
  const redisHits = cacheStats.redis_hits ?? totalHits;
  const redisEntries = cacheStats.redis_entries ?? cachedResponses;
  const redisAvailable = cacheStats.redis_available ?? false;
  const requestsServed = totalHits;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

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

        {/* Cache Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Redis Cache Health
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fast in-memory cache for sub-ms responses
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  redisAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {redisAvailable ? "Online" : "Offline"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Entries tracked</span>
                <span className="text-lg font-bold text-gray-900">
                  {redisEntries.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Cache hits (Redis)</span>
                <span className="text-lg font-bold text-green-600">
                  {redisHits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Overall hit rate</span>
                <span className="text-lg font-bold text-purple-600">
                  {cacheHitRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => openClearModal("redis")}
              className="btn-danger-outline flex items-center gap-2 text-sm mt-6"
            >
              <Trash2 className="w-4 h-4" />
              Clear cache
            </button>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Persistent Cache Overview
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Warm storage layer backed by PostgreSQL
                </p>
              </div>
              <button
                onClick={() => openClearModal("postgresql")}
                className="btn-danger-outline flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear cache
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Detailed PostgreSQL metrics are not yet exposed via the API, but
              you can still monitor aggregate usage and savings below.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Cached responses observed
                </p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {cachedResponses.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Estimated savings to date
                </p>
                <p className="text-xl font-semibold text-green-600 mt-1">
                  {formatCurrency(estimatedSavings)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Impact */}
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lifetime Cache Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Requests Served from Cache
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {requestsServed.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Cost Saved</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {formatCurrency(estimatedSavings)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Clear All Cache
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Remove all cached responses from both Redis and PostgreSQL. This
                action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => openClearModal("all")}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Cache
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-blue-900 mb-6">
            How Caching Works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>Redis:</strong> Fast in-memory cache with 1 hour TTL for
                instant responses
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                <strong>PostgreSQL:</strong> Persistent storage for long-term
                analytics and cost tracking
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>
                Identical requests (same model + messages) return cached
                responses instantly
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Cached responses cost $0 and have ~0ms latency</span>
            </li>
          </ul>
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
                Requested scope: <span className="font-medium">{clearType}</span>
              </p>
              <p className="text-sm mt-1">
                This action clears both Redis and PostgreSQL caches and cannot be
                undone. Future requests will go directly to the LLM providers
                until the cache warms back up.
              </p>
            </div>
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
              disabled={clearing}
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
