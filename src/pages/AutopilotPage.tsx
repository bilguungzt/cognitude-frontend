import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services';
import type {
  AutopilotClassificationBreakdown,
  AutopilotModelRouting,
  AutopilotSavings,
  AutopilotLog,
} from '../types/api';

const AutopilotPage: React.FC = () => {
  const [classificationBreakdown, setClassificationBreakdown] =
    useState<AutopilotClassificationBreakdown>({});
  const [modelRouting, setModelRouting] = useState<AutopilotModelRouting>({});
  const [savings, setSavings] = useState<AutopilotSavings | null>(null);
  const [logs, setLogs] = useState<AutopilotLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        classificationBreakdownData,
        modelRoutingData,
        savingsData,
        logsData,
      ] = await Promise.all([
        api.getAutopilotClassificationBreakdown(),
        api.getAutopilotModelRouting(),
        api.getAutopilotSavings(),
        api.getAutopilotLogs(),
      ]);
      setClassificationBreakdown(classificationBreakdownData);
      setModelRouting(modelRoutingData);
      setSavings(savingsData);
      setLogs(logsData);
    } catch (err) {
      setError(api.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout title="Autopilot Dashboard">
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Autopilot Dashboard">
        <div>Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Autopilot Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold">Cost Savings</h2>
          <p className="text-2xl font-bold">
            ${savings?.cost_savings.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            Total savings from automatic model selection
          </p>
        </div>
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold">Cache Hit Rate</h2>
          <p className="text-2xl font-bold">
            {(savings?.cache_hit_rate ?? 0) * 100}%
          </p>
          <p className="text-xs text-muted-foreground">
            Cache hit rate for Autopilot requests
          </p>
        </div>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold">Classification Breakdown</h2>
          {/* Placeholder for Pie/Donut chart */}
          <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center mt-2">
            <p>Classification Breakdown Chart</p>
          </div>
        </div>
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold">Model Routing Statistics</h2>
          {/* Placeholder for Bar chart */}
          <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center mt-2">
            <p>Model Routing Statistics Chart</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold">Real-time Logs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Original Model
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Selected Model
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.original_model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.selected_model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AutopilotPage;