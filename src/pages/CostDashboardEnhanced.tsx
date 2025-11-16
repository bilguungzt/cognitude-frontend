import { useState, useMemo } from "react";
import { useApiQuery } from "../hooks/useApiQuery";
import api from "../services";
import type {
  UsageStats,
  DailyUsage,
  AutopilotSavingsBreakdown as AutopilotSavingsBreakdownType,
  AutopilotSavings,
  AutopilotModelRouting,
} from "../types/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Download,
  RefreshCw,
  PieChart as PieChartIcon,
  ShieldCheck,
} from "lucide-react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import AutopilotSavingsBreakdown from "../components/AutopilotSavingsBreakdown";

const DEFAULT_SAVINGS_BREAKDOWN = [
  { label: "Smart Routing", amount: 450 },
  { label: "Caching", amount: 350 },
  { label: "Rate Optimization", amount: 200 },
];

const DEFAULT_ROUTING_SHARE = [
  { model: "gpt-4o-mini", percentage: 62 },
  { model: "claude-sonnet", percentage: 24 },
  { model: "gpt-4o", percentage: 14 },
];

const ROUTING_COLORS = [
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f97316",
  "#facc15",
  "#ec4899",
];

export default function CostDashboardEnhanced() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Validate date range
  const isValidDateRange = (() => {
    try {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    } catch {
      return false;
    }
  })();

  const analyticsData = useApiQuery<UsageStats>({
    queryKey: ["usage-stats", dateRange.start, dateRange.end],
    queryFn: () =>
      api.getUsageStats({
        start_date: dateRange.start,
        end_date: dateRange.end,
        group_by: "day",
      }),
    zeroStateOn404: {
      total_requests: 0,
      total_cost: 0,
      average_latency: 0,
      cache_hit_rate: 0,
      total_tokens: 0,
      usage_by_day: [],
      usage_by_provider: [],
      usage_by_model: [],
    },
    enabled: isValidDateRange,
  });

  const autopilotSavingsBreakdown = useApiQuery<AutopilotSavingsBreakdownType>({
    queryKey: ["autopilot-savings-breakdown", dateRange.start, dateRange.end],
    queryFn: () =>
      api.getAutopilotSavingsBreakdown({
        start_date: dateRange.start,
        end_date: dateRange.end,
      }),
    zeroStateOn404: {},
    enabled: isValidDateRange,
  });

  const autopilotSavings = useApiQuery<AutopilotSavings>({
    queryKey: ["autopilot-savings", dateRange.start, dateRange.end],
    queryFn: () => api.getAutopilotSavings(),
    zeroStateOn404: { cost_savings: 0, cache_hit_rate: 0 },
    enabled: isValidDateRange,
  });

  const autopilotModelRouting = useApiQuery<AutopilotModelRouting>({
    queryKey: ["autopilot-model-routing", dateRange.start, dateRange.end],
    queryFn: () => api.getAutopilotModelRouting(),
    zeroStateOn404: {},
    enabled: isValidDateRange,
  });

  const loading =
    isValidDateRange &&
    (analyticsData.isLoading ||
      autopilotSavingsBreakdown.isLoading ||
      autopilotSavings.isLoading ||
      autopilotModelRouting.isLoading);
  const error =
    isValidDateRange &&
    (analyticsData.error ||
      autopilotSavingsBreakdown.error ||
      autopilotSavings.error ||
      autopilotModelRouting.error)
      ? String(
          analyticsData.error ||
            autopilotSavingsBreakdown.error ||
            autopilotSavings.error ||
            autopilotModelRouting.error
        )
      : null;
  const autopilotBreakdownAvailable =
    autopilotSavingsBreakdown.data &&
    Object.keys(autopilotSavingsBreakdown.data).length > 0;

  const handleRefresh = () => {
    if (isValidDateRange) {
      analyticsData.refetch();
      autopilotSavingsBreakdown.refetch();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDateChange = (key: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
  };

  const exportToCSV = () => {
    if (!analyticsData.data?.usage_by_day.length) return;

    const headers = ["Date", "Requests", "Cost"];
    const rows = dailyUsageData.map((day: DailyUsage) => [
      day.date,
      day.requests.toString(),
      day.cost.toString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cost-analytics-${dateRange.start}-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate trends
  const dailyUsageData = useMemo(
    () => analyticsData.data?.usage_by_day ?? [],
    [analyticsData.data]
  );

  const costTrend = useMemo(() => {
    if (!dailyUsageData.length) {
      return 0;
    }
    const first = dailyUsageData[0]?.cost || 1;
    const last = dailyUsageData[dailyUsageData.length - 1]?.cost || 0;
    return ((last - first) / first) * 100;
  }, [dailyUsageData]);

  const avgCostPerRequest = useMemo(() => {
    if (!analyticsData.data) return 0;
    const data = analyticsData.data;
    return data.total_cost / (data.total_requests || 1);
  }, [analyticsData.data]);

  if (loading) {
    return (
      <Layout title="Cost Analytics">
        <LoadingSpinner size="lg" text="Loading cost analytics..." />
      </Layout>
    );
  }

  if (!isValidDateRange) {
    return (
      <Layout title="Cost Analytics">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="alert-error">
            <p>
              Please select a valid date range (start date must be before end
              date)
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Cost Analytics">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="alert-error">
            <p>Failed to load cost analytics: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cost Analytics & Usage">
      <div className="max-w-6xl mx-auto px-4 px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Cost Analytics
            </h2>
            <p className="text-gray-600">
              Monitor your API usage and spending trends
            </p>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="card mb-8">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <Calendar className="w-5 h-5 inline mr-2" />
                Date Range
              </h3>

              {/* Quick Range Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleQuickRange(7)}
                  className="btn-ghost btn-sm"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handleQuickRange(30)}
                  className="btn-ghost btn-sm"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handleQuickRange(90)}
                  className="btn-ghost btn-sm"
                >
                  Last 90 Days
                </button>
              </div>

              {/* Custom Range */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex-1">
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-4 xl:mt-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-outline w-full md:w-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={!analyticsData.data?.usage_by_day.length}
                className="btn-primary w-full md:w-auto"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert-error mb-6">
            <p>{error}</p>
          </div>
        )}

        {analyticsData.data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success-600" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      costTrend >= 0 ? "text-danger-600" : "text-success-600"
                    }`}
                  >
                    {costTrend >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(costTrend).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Spend
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.data?.total_cost || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                </p>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {(analyticsData.data?.total_requests || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Across all models</p>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Avg Cost/Request
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(avgCostPerRequest)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Per API call</p>
              </div>

              <div className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Cost per Request
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(avgCostPerRequest)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Average cost</p>
              </div>
            </div>

            {/* Charts */}
            {analyticsData && dailyUsageData.length > 0 ? (
              <>
                {/* Cost Trend Chart */}
                <div className="card mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Cost Trend
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyUsageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorCost"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#0ea5e9"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#0ea5e9"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            formatCurrency(Number(value))
                          }
                          stroke="#6b7280"
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(Number(value)),
                            "Cost",
                          ]}
                          labelFormatter={(label) =>
                            `Date: ${formatDate(label)}`
                          }
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cost"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorCost)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Requests Chart */}
                <div className="card mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Daily Requests
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyUsageData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <Tooltip
                          formatter={(value) => [
                            Number(value).toLocaleString(),
                            "Requests",
                          ]}
                          labelFormatter={(label) =>
                            `Date: ${formatDate(label)}`
                          }
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="requests"
                          fill="#a855f7"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Reconciliation / Autopilot Sections */}
                <div className="mb-8">
                  <CostReconciliationCard />
                </div>

                {autopilotUnavailable && (
                  <div className="card mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Autopilot insights unavailable
                    </h3>
                    <p className="text-sm text-gray-600">
                      Autopilot analytics endpoints are not available in this
                      environment yet. Once they are deployed, savings
                      visualizations will appear here automatically.
                    </p>
                  </div>
                )}

                {autopilotSavingsBreakdown.data && !autopilotUnavailable && (
                  <div className="mb-8">
                    <AutopilotSavingsBreakdown
                      data={autopilotSavingsBreakdown.data}
                    />
                  </div>
                )}

                {/* Usage Table */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Daily Usage Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    {/* Mobile View - Stacked Layout */}
                    <div className="sm:hidden space-y-3">
                      {dailyUsageData.map((day: DailyUsage, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(day.cost)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Requests:</span>{" "}
                              {day.requests.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Cost/Request:</span>{" "}
                              {formatCurrency(day.cost / day.requests)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View - Table */}
                    <div className="hidden sm:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Requests
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost/Request
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dailyUsageData.map(
                            (day: DailyUsage, index: number) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {day.requests.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-medium">
                                  {formatCurrency(day.cost)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                  {formatCurrency(day.cost / day.requests)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-12 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No data available
                </h3>
                <p className="text-gray-600">
                  There's no usage data for the selected date range
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No analytics data
            </h3>
            <p className="text-gray-600">
              Start making API requests to see your cost analytics
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
