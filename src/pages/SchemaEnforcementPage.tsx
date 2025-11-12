import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Upload, AlertTriangle, CheckCircle, XCircle, FileJson } from 'lucide-react';
import { api } from '../services/api';
import type { SchemaStat, ValidationLog } from '../types/api';
import { UploadSchemaModal } from '../components/UploadSchemaModal';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="card p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 bg-${color}-100 rounded-full`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
        </div>
    </div>
);

const SchemaEnforcementPage: React.FC = () => {
  const [schemas, setSchemas] = useState<SchemaStat[]>([]);
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  // const [retryData, setRetryData] = useState<RetryAttemptsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schemasRes, logsRes] = await Promise.all([
        api.getActiveSchemas(),
        api.getFailedValidationLogs(),
        // api.getRetryAttemptsData(),
      ]);
      setSchemas(schemasRes);
      setLogs(logsRes);
      // setRetryData(retryRes);
    } catch (err) {
      setError(api.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalFailures = schemas.reduce((acc, schema) => acc + (schema.total_attempts * (1 - schema.failure_rate)), 0);
  const overallSuccessRate = schemas.length > 0
    ? (schemas.reduce((acc, schema) => acc + schema.failure_rate, 0) / schemas.length) * 100
    : 100;

  if (loading) {
    return (
      <Layout title="Schema Enforcement">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" text="Loading schema data..." />
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
            <StatCard title="Total Schemas" value={schemas.length} icon={FileJson} color="purple" />
            <StatCard title="Overall Success Rate" value={`${overallSuccessRate.toFixed(1)}%`} icon={CheckCircle} color="green" />
            <StatCard title="Total Failures (24h)" value={totalFailures} icon={XCircle} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Schemas</h3>
            {schemas.length > 0 ? (
                <ul className="space-y-2">
                  {schemas.map((schema) => (
                    <li key={schema.schema_name} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                      <span className="font-medium text-gray-800">{schema.schema_name}</span>
                      <div className="text-right">
                        <div className="text-green-600">Success: {(schema.failure_rate * 100).toFixed(1)}%</div>
                        <div className="text-sm text-red-600">Failures: {Math.round(schema.total_attempts * (1 - schema.failure_rate))}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No active schemas found.</p>
              )}
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retry Attempts</h3>
            <div className="h-64 w-full bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Retry Attempts Chart Coming Soon</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Failed Validation Logs</h3>
            <div className="h-96 overflow-y-auto border rounded-md">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{log.request_id}</span>
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.error_details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No failed validation logs in the last 24 hours.</p>
                </div>
              )}
            </div>
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