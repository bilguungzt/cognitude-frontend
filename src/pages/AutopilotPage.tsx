import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Layout from "../components/Layout";
import { api } from "../services";
import {
  DollarSign,
  Zap,
  Clock,
  CheckCircle,
  TrendingDown,
  BarChart3,
  Sparkles,
  ArrowRight,
  Gauge,
} from "lucide-react";
import HeroStats from "../components/Autopilot/HeroStats";
import StatCard from "../components/Autopilot/StatCard";
import ClassificationChart from "../components/Autopilot/ClassificationChart";
import ModelRoutingChart from "../components/Autopilot/ModelRoutingChart";
import Skeleton from "../components/Skeleton";
import type { AutopilotDashboardData } from "../types/api";

const AutopilotPage: React.FC = () => {
  const [data, setData] = useState<AutopilotDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await api.getAutopilotDashboardData();
        setData(dashboardData);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setApiUnavailable(true);
          setData(null);
        } else {
          setError(api.handleError(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const renderSkeletons = () => (
    <div className="space-y-8">
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );

  const classificationChartData = useMemo(() => {
    if (!data) return {};
    return data.classificationBreakdown.labels.reduce((acc, label, index) => {
      acc[label] = data.classificationBreakdown.datasets[0].data[index];
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  const logs = useMemo(() => data?.logs ?? [], [data]);

  const hasNoData = apiUnavailable || (!loading && !data);

  return (
    <Layout title="Autopilot Dashboard">
      {hasNoData ? (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="card p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-100">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  ⚡ Autopilot: AI-Powered Cost & Performance Optimization
                </h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Let AI automatically route your requests to the most
                  cost-effective model without sacrificing quality. Save up to
                  60% on LLM costs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        Up to 60% Savings
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Automatically route to cheaper models when quality allows
                    </p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        Zero Quality Loss
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ML-powered classification ensures task-appropriate routing
                    </p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold text-gray-900">
                        Set & Forget
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      No manual intervention—optimizes in real-time
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-lg transition-all">
                    <Zap className="mr-2 h-5 w-5" /> Enable Autopilot
                  </button>
                  <button
                    className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-lg flex items-center border border-gray-300"
                    onClick={() =>
                      window.open(
                        "https://docs.cognitude.io/autopilot",
                        "_blank"
                      )
                    }
                  >
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              How Autopilot Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                  1
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Request Analysis
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI classifies each request by complexity: simple, moderate,
                    or complex tasks
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  2
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Smart Routing
                  </h4>
                  <p className="text-sm text-gray-600">
                    Routes to the most cost-effective model that meets quality
                    requirements
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                  3
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Continuous Learning
                  </h4>
                  <p className="text-sm text-gray-600">
                    System learns from outcomes to improve routing decisions
                    over time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              💡 Perfect For
            </h3>
            <p className="text-gray-600 mb-6">
              Autopilot shines in these common scenarios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      High-Volume Chatbots
                    </h4>
                    <p className="text-sm text-gray-600">
                      Route simple FAQ responses to cheaper models, use premium
                      models only for complex queries
                    </p>
                    <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                      Typical savings: 40-60%
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Content Generation
                    </h4>
                    <p className="text-sm text-gray-600">
                      Draft generation with smaller models, final polish with
                      GPT-4 only when needed
                    </p>
                    <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                      Typical savings: 35-50%
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Data Extraction
                    </h4>
                    <p className="text-sm text-gray-600">
                      Structured data parsing doesn't need GPT-4—save costs with
                      smaller models
                    </p>
                    <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                      Typical savings: 50-65%
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Code Completion
                    </h4>
                    <p className="text-sm text-gray-600">
                      Simple completions use fast/cheap models, complex
                      refactors get premium AI
                    </p>
                    <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                      Typical savings: 30-45%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Savings */}
          <div className="card p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Projected Savings
            </h3>
            <p className="text-gray-600 mb-6">
              See how much you could save with Autopilot based on typical usage
              patterns
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                <p className="text-sm text-gray-600 mb-1">10K requests/month</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">$120</p>
                <p className="text-sm text-green-600 font-semibold">
                  Save ~$70/mo (40%)
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                <p className="text-sm text-gray-600 mb-1">
                  100K requests/month
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">$1,200</p>
                <p className="text-sm text-green-600 font-semibold">
                  Save ~$600/mo (50%)
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                <p className="text-sm text-gray-600 mb-1">1M requests/month</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">$12,000</p>
                <p className="text-sm text-green-600 font-semibold">
                  Save ~$7,200/mo (60%)
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        renderSkeletons()
      ) : error ? (
        <div className="text-center text-red-500">
          <p>Error loading dashboard data:</p>
          <p>{error}</p>
        </div>
      ) : data ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants}>
            <HeroStats stats={data.heroStats} />
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {data.keyMetrics.map((metric, index) => {
              const icons = {
                "Optimization Rate": Zap,
                "Avg. Response Time": Clock,
                "Total Requests": DollarSign,
              };
              const Icon =
                icons[metric.title as keyof typeof icons] || DollarSign;
              return (
                <StatCard
                  key={index}
                  icon={Icon}
                  title={metric.title}
                  value={metric.value}
                  comparisonText={metric.comparison}
                />
              );
            })}
          </motion.div>

          {/* Charts */}
          <motion.div
            variants={itemVariants}
            className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2"
          >
            <ClassificationChart data={classificationChartData} />
            <ModelRoutingChart data={logs} />
          </motion.div>

          {/* Real-time Logs */}
          <motion.div variants={itemVariants}>
            {/* Using light-mode-friendly styles for the container */}
            <div className="bg-white/50 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Real-time Logs
              </h2>
              <div className="overflow-x-auto">
                {/* Mobile View */}
                <div className="sm:hidden space-y-3">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          ${log.cost_saved.toFixed(4)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Original:</span>{" "}
                          {log.original_model}
                        </div>
                        <div>
                          <span className="font-medium">Selected:</span>{" "}
                          {log.selected_model}
                        </div>
                        <div>
                          <span className="font-medium">Speed:</span>{" "}
                          {log.speed_improvement}ms
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Reason:</span>{" "}
                          {log.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop View */}
                <div className="hidden sm:block">
                  <table className="min-w-full">
                    {/* --- HEADER --- */}
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Original Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Selected Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Cost Saved
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Speed Improv.
                        </th>
                      </tr>
                    </thead>

                    {/* --- BODY --- */}
                    <tbody>
                      {logs.map((log, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          {/* Timestamp */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>

                          {/* Models (Slightly lighter text) */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {log.original_model}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {log.selected_model}
                          </td>

                          {/* Reason (Allows wrapping) */}
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.reason}
                          </td>

                          {/* Cost Saved */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                            ${log.cost_saved.toFixed(4)}
                          </td>

                          {/* Speed Improv. */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                            {log.speed_improvement}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </Layout>
  );
};

export default AutopilotPage;
