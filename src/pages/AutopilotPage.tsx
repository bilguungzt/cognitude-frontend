import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { api } from '../services';
import { DollarSign, Zap, Clock } from 'lucide-react';
import HeroStats from '../components/Autopilot/HeroStats';
import StatCard from '../components/Autopilot/StatCard';
import ClassificationChart from '../components/Autopilot/ClassificationChart';
import ModelRoutingChart from '../components/Autopilot/ModelRoutingChart';
import Skeleton from '../components/Skeleton';
import type { AutopilotDashboardData } from '../types/api';

const AutopilotPage: React.FC = () => {
  const [data, setData] = useState<AutopilotDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await api.getAutopilotDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(api.handleError(err));
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
        type: 'spring' as const,
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

  return (
    <Layout title="Autopilot Dashboard">
      {loading ? (
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
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {data.keyMetrics.map((metric, index) => {
              const icons = {
                "Optimization Rate": Zap,
                "Avg. Response Time": Clock,
                "Total Requests": DollarSign,
              };
              const Icon = icons[metric.title as keyof typeof icons] || DollarSign;
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
            className="grid gap-4 md:grid-cols-1 lg:grid-cols-2"
          >
            <ClassificationChart
              data={data.classificationBreakdown.labels.reduce(
                (acc, label, index) => {
                  acc[label] = data.classificationBreakdown.datasets[0].data[index];
                  return acc;
                },
                {} as { [key: string]: number }
              )}
            />
            <ModelRoutingChart data={data.logs} />
          </motion.div>

          {/* Real-time Logs */}
          <motion.div variants={itemVariants}>
            <div className="p-4 border rounded-md bg-card text-card-foreground">
              <h2 className="text-lg font-semibold mb-4">Real-time Logs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Original Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Selected Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost Saved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Speed Improv.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.logs.map((log, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.original_model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.selected_model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">${log.cost_saved.toFixed(4)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">{log.speed_improvement}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </Layout>
  );
};

export default AutopilotPage;