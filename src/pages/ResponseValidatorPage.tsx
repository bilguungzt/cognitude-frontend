import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../services/api';
import type {
  ValidationStats,
  IssueBreakdown,
  AutofixStats,
  ValidationTimelineEvent,
} from '../types/api';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import IssueChart from '../components/Validator/IssueChart';
import AutofixChart from '../components/Validator/AutofixChart';
import Skeleton from '../components/Skeleton';

type StatColor = 'green' | 'red' | 'blue';

const validatorStatColors: Record<StatColor, { bg: string; text: string }> = {
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
};

interface StatCardProps {
  title: string;
  value: string;
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
            <div className={`p-3 rounded-full ${validatorStatColors[color].bg}`}>
                <Icon className={`w-6 h-6 ${validatorStatColors[color].text}`} />
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
  const [apiUnavailable, setApiUnavailable] = useState(false);

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
      const axiosError = err as AxiosError;
      if (axiosError.isAxiosError && axiosError.response?.status === 404) {
        setApiUnavailable(true);
        setStats(null);
        setIssueBreakdown(null);
        setAutofixStats(null);
        setTimeline([]);
      } else {
        setError(api.handleError(err));
      }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
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

  if (apiUnavailable) {
    return (
      <Layout title="Response Validator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon={AlertTriangle}
            title="Validator metrics unavailable"
            description="The backend endpoints for /validator/* are not available in this environment yet. Once they are deployed, this dashboard will automatically populate."
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
              <IssueChart data={issueBreakdown} />
            ) : (
              <p className="text-sm text-gray-500">No issues detected in the selected period.</p>
            )}
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-fix Retry Statistics</h3>
            {autofixStats ? (
              <AutofixChart data={autofixStats} />
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