import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Button } from '../components/Button';
import { Upload, AlertTriangle, CheckCircle, XCircle, FileJson } from 'lucide-react';
import { api } from '../services/api';
import type { SchemaStat, ValidationLog } from '../types/api';
import { UploadSchemaModal } from '../components/UploadSchemaModal';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

type StatColor = 'purple' | 'green' | 'red';

const statColorClasses: Record<StatColor, { bg: string; text: string }> = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: StatColor;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="card p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${statColorClasses[color].bg}`}>
                <Icon className={`w-6 h-6 ${statColorClasses[color].text}`} />
            </div>
        </div>
    </div>
);

const SchemaEnforcementPage: React.FC = () => {
  const [activeSchemas, setActiveSchemas] = useState<SchemaStat[]>([]);
  const [topSchemas, setTopSchemas] = useState<SchemaStat[]>([]);
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schemasRes, logsRes, statsRes] = await Promise.all([
        api.getActiveSchemas(),
        api.getFailedValidationLogs(),
        api.getSchemaStats(),
      ]);
      setActiveSchemas(schemasRes);
      setLogs(logsRes);
      setTopSchemas(statsRes.top_5_most_used);
    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.status === 404) {
        // This is the "zero state" for a new user with no data.
        setActiveSchemas([]);
        setLogs([]);
        setTopSchemas([]);
      } else {
        setError(api.handleError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalFailures = activeSchemas.reduce(
    (acc, schema) => acc + schema.total_attempts * schema.failure_rate,
    0
  );
  const totalAttempts = activeSchemas.reduce(
    (acc, schema) => acc + schema.total_attempts,
    0
  );
  const overallSuccessRate =
    totalAttempts > 0
      ? (((totalAttempts - totalFailures) / totalAttempts) * 100)
      : 100;
  const roundedFailures = Math.round(totalFailures);

  if (loading) {
    return (
      <Layout title="Schema Enforcement">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Schema Enforcement">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon={AlertTriangle}
            title="Failed to load schema data"
            description={error}
            action={{
              label: 'Retry',
              onClick: fetchData,
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Schema Enforcement">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Schema Enforcement</h2>
            <p className="text-gray-600">Ensure your LLM responses adhere to predefined JSON schemas.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Schema
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Active Schemas" value={activeSchemas.length} icon={FileJson} color="purple" />
            <StatCard title="Overall Success Rate" value={`${overallSuccessRate.toFixed(1)}%`} icon={CheckCircle} color="green" />
            <StatCard title="Total Failures (24h)" value={roundedFailures} icon={XCircle} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Schemas</h3>
            {activeSchemas.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schema Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure Rate</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Retries</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeSchemas.map((schema) => (
                    <tr key={schema.schema_name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schema.schema_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schema.total_attempts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(schema.failure_rate * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schema.avg_retries.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No active schemas found.</p>
            )}
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Most Used Schemas</h3>
            {topSchemas.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schema Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Attempts</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topSchemas.map((schema) => (
                    <tr key={schema.schema_name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schema.schema_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schema.total_attempts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(schema.failure_rate * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No schema statistics available.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Failed Validation Logs (Last 24h)</h3>
            {logs.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono text-xs">{log.request_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{log.error_details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No failed validation logs in the last 24 hours.</p>
            )}
        </div>
      </div>
      <UploadSchemaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSchemaUploaded={() => {
          fetchData(); // Refresh data after upload
        }}
      />
    </Layout>
  );
};

export default SchemaEnforcementPage;