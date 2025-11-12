import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../services/api";
import DashboardHero from "../components/Dashboard/DashboardHero";
import { EnhancedStatCard } from "../components/Dashboard/EnhancedStatCard";
import BestOptimizationCard from "../components/Dashboard/BestOptimizationCard";
import ActivityFeed from "../components/Dashboard/ActivityFeed";
import SavingsChart from "../components/Dashboard/SavingsChart";
import CacheChart from "../components/Dashboard/CacheChart";
import EmptyState from "../components/EmptyState";

// Define a type for the enhanced dashboard data
import type { EnhancedDashboardData } from "../types/api";

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EnhancedDashboardData | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await api.getEnhancedDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(api.handleError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="ml-4 text-lg text-gray-400">Loading Dashboard...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-12">
          <EmptyState
            icon={AlertTriangle}
            title="Failed to load dashboard"
            description={error}
            action={{
              label: "Retry",
              onClick: loadDashboardData,
            }}
          />
        </div>
      );
    }

    if (!data) {
      return (
        <div className="mt-12">
          <EmptyState
            icon={AlertTriangle}
            title="No Data Available"
            description="We couldn't find any dashboard data. Please check back later."
          />
        </div>
      );
    }

    const savingsChartData = data.savingsOverTime.labels.map((label, index) => ({
      date: label,
      cumulativeSavings: data.savingsOverTime.datasets[0].data[index],
    }));

    const cacheChartData = data.cacheVsFresh.labels.map((label, index) => ({
      time: label,
      cached: data.cacheVsFresh.datasets[0].data[index],
      fresh: data.cacheVsFresh.datasets[1].data[index],
    }));

    return (
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <DashboardHero {...data.heroStats} />
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {data.keyMetrics.map((metric, index) => (
            <EnhancedStatCard
              key={index}
              title={metric.title}
              value={parseFloat(metric.value.replace(/[^0-9.-]+/g, ""))}
              trend={metric.trend}
              sparklineData={metric.sparklineData.map((value, name) => ({
                name: name.toString(),
                value,
              }))}
              color={metric.color === "red" ? "orange" : metric.color}
              tooltipText={metric.title}
              icon={Loader}
              prefix={metric.value.startsWith("$") ? "$" : ""}
              suffix={metric.value.endsWith("%") ? "%" : ""}
            />
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          variants={itemVariants}
        >
          <div className="lg:col-span-3">
            <SavingsChart data={savingsChartData} />
          </div>
          <div className="lg:col-span-2">
            <CacheChart data={cacheChartData} />
          </div>
        </motion.div>

        {/* Killer Features & Activity */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={itemVariants}
        >
          <div className="lg:col-span-1">
            <BestOptimizationCard
              originalModel={data.bestOptimization.originalModel}
              selectedModel={data.bestOptimization.selectedModel}
              savingsPerRequest={data.bestOptimization.savingsPerRequest}
              totalImpact={data.bestOptimization.totalImpact}
              requestCount={data.bestOptimization.requestCount}
            />
          </div>
          <div className="lg:col-span-2">
            <ActivityFeed
              events={data.activityFeed.map((event) => ({
                ...event,
                type: "routing",
              }))}
            />
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </Layout>
  );
}
