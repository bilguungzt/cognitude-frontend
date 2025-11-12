import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../services/api';
import type {
  ValidationStats,
  IssueBreakdown,
  AutofixStats,
  ValidationTimelineEvent,
} from '../types/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

interface StatCardProps {
  title: string;
  value: string;
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

const ResponseValidatorPage: React.FC = () => {
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [issueBreakdown, setIssueBreakdown] = useState<IssueBreakdown | null>(null);
  const [autofixStats, setAutofixStats] = useState<AutofixStats | null>(null);
  const [timeline, setTimeline] = useState<ValidationTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        status: statusFilter,
        error_type: errorTypeFilter === 'all' ? undefined : errorTypeFilter,
      };
      const [statsRes, issueBreakdownRes, autofixStatsRes, timelineRes] = await Promise.all([
        api.getValidationStats(),
        api.getIssueBreakdown(),
        api.getAutofixStats(),
        api.getValidationTimeline(params),
      ]);
      setStats(statsRes);
      setIssueBreakdown(issueBreakdownRes);
      setAutofixStats(autofixStatsRes);
      setTimeline(timelineRes);
    } catch (err) {
      setError(api.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, errorTypeFilter]);

  if (loading) {
    return (
      <Layout title="Response Validator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" text="Loading validation data..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Response Validator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon={AlertTriangle}
            title="Failed to load validation data"
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
    <Layout title="Response Validator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Response Validator</h2>
          <p className="text-gray-600">Monitor and analyze the health of your LLM response validation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Validation Success Rate" value={`${(stats?.success_rate ?? 0).toFixed(1)}%`} icon={CheckCircle} color="green" />
            <StatCard title="Validation Failure Rate" value={`${(stats?.failure_rate ?? 0).toFixed(1)}%`} icon={XCircle} color="red" />
            <StatCard title="Auto-fix Success Rate" value={`${(stats?.autofix_success_rate ?? 0).toFixed(1)}%`} icon={Zap} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Detected</h3>
            {issueBreakdown && Object.keys(issueBreakdown).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(issueBreakdown).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No issues detected in the selected period.</p>
              )}
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-fix Retry Statistics</h3>
            {autofixStats ? (
                <ul className="space-y-2">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Average Retries</span>
                    <span className="font-medium text-gray-900">{autofixStats.average_retries.toFixed(2)}</span>
                  </li>
                  {Object.entries(autofixStats.retries).map(([key, value]) => (
                    <li key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{key} Retries</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No auto-fix data available.</p>
              )}
          </div>
        </div>

        <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Timeline</h3>
            <div className="flex space-x-4 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failure')}
                className="input"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
              <select
                value={errorTypeFilter}
                onChange={(e) => setErrorTypeFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Error Types</option>
                {issueBreakdown && Object.keys(issueBreakdown).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div className="h-96 overflow-y-auto border rounded-md">
              {timeline.length > 0 ? (
                timeline.map((event) => (
                  <div key={event.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
                    {event.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                    )}
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{event.request_summary}</p>
                      {event.error_type && <p className="text-sm text-red-600">{event.error_type}</p>}
                    </div>
                    <span className="text-xs text-gray-500 ml-4 flex-shrink-0">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No validation events for the selected filters.</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResponseValidatorPage;