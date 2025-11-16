import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  RefreshCw,
  TrendingUp,
  FileCheck,
  Brain,
  Clock,
} from "lucide-react";
import { api } from "../services/api";
import type {
  ValidationStats,
  IssueBreakdown,
  AutofixStats,
  ValidationTimelineEvent,
} from "../types/api";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import IssueChart from "../components/Validator/IssueChart";
import AutofixChart from "../components/Validator/AutofixChart";
import Skeleton from "../components/Skeleton";

type StatColor = "green" | "red" | "blue";

const validatorStatColors: Record<StatColor, { bg: string; text: string }> = {
  green: { bg: "bg-green-100", text: "text-green-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: StatColor;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
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
  const [issueBreakdown, setIssueBreakdown] = useState<IssueBreakdown | null>(
    null
  );
  const [autofixStats, setAutofixStats] = useState<AutofixStats | null>(null);
  const [timeline, setTimeline] = useState<ValidationTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "failure"
  >("all");
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>("all");
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        status: statusFilter,
        error_type: errorTypeFilter === "all" ? undefined : errorTypeFilter,
      };
      const [statsRes, issueBreakdownRes, autofixStatsRes, timelineRes] =
        await Promise.all([
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
              label: "Retry",
              onClick: fetchData,
            }}
          />
        </div>
      </Layout>
    );
  }

  const hasNoData = apiUnavailable || (!loading && !stats);

  if (hasNoData) {
    return (
      <Layout title="Response Validator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero Section */}
          <div className="card p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-100">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  🛡️ Response Validator: Catch & Fix LLM Errors Automatically
                </h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Validate every LLM response against your rules and
                  automatically retry with corrections when issues are detected.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">
                        Catch Errors Early
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Detect hallucinations, format issues, and invalid data
                      before they reach users
                    </p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-gray-900">
                        Auto-Fix & Retry
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Automatically retry with detailed error context for higher
                      success rates
                    </p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-teal-600" />
                      <span className="font-semibold text-gray-900">
                        Improve Quality
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Track validation metrics and continuously improve response
                      reliability
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-lg transition-all">
                    <Shield className="mr-2 h-5 w-5" /> Enable Validator
                  </button>
                  <button
                    className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-lg flex items-center border border-gray-300"
                    onClick={() =>
                      window.open(
                        "https://docs.cognitude.io/validator",
                        "_blank"
                      )
                    }
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-green-600" />
              How Response Validation Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                  1
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Define Rules
                  </h4>
                  <p className="text-sm text-gray-600">
                    Set validation rules: schema checks, banned words, format
                    requirements, etc.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                  2
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Validate Response
                  </h4>
                  <p className="text-sm text-gray-600">
                    Every LLM response is checked against your validation rules
                    automatically
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                  3
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Detect Issues
                  </h4>
                  <p className="text-sm text-gray-600">
                    Identify format errors, hallucinations, or rule violations
                    in real-time
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  4
                </div>
                <div className="pl-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Auto-Fix</h4>
                  <p className="text-sm text-gray-600">
                    Retry with error details to get corrected responses without
                    manual intervention
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ✅ Perfect For
            </h3>
            <p className="text-gray-600 mb-6">
              Response Validator ensures quality in these critical scenarios
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-5 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Structured Data Extraction
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ensure extracted JSON always matches your schema - no more
                      parsing errors
                    </p>
                    <div className="mt-2 inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                      Prevents: Invalid JSON, missing fields
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Hallucination Detection
                    </h4>
                    <p className="text-sm text-gray-600">
                      Catch when LLMs make up facts, IDs, or references that
                      don't exist
                    </p>
                    <div className="mt-2 inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded">
                      Prevents: Fake data, invalid references
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Compliance & Safety
                    </h4>
                    <p className="text-sm text-gray-600">
                      Block harmful content, PII leaks, or responses that
                      violate policies
                    </p>
                    <div className="mt-2 inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                      Prevents: Policy violations, data leaks
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      API Integration
                    </h4>
                    <p className="text-sm text-gray-600">
                      Validate responses before they're sent to downstream
                      systems or APIs
                    </p>
                    <div className="mt-2 inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">
                      Prevents: Integration failures, bad data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Rules Examples */}
          <div className="card p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Common Validation Rules
            </h3>
            <p className="text-gray-600 mb-6">
              Examples of validation rules you can configure
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Schema Validation
                </h4>
                <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700">
                  <pre>{`{
  "type": "object",
  "required": ["name", "email"]
}`}</pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Ensure responses match JSON schema
                </p>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Banned Patterns
                </h4>
                <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700">
                  <pre>{`[
  "As an AI language model",
  "I cannot provide"
]`}</pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Block unwanted phrases or disclaimers
                </p>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Required Fields
                </h4>
                <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700">
                  <pre>{`{
  "must_include": ["summary", "confidence"]
}`}</pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Ensure critical fields are present
                </p>
              </div>
              <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Format Checks
                </h4>
                <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700">
                  <pre>{`{
  "email_format": true,
  "url_format": true
}`}</pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Validate data formats automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Response Validator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Response Validator
          </h2>
          <p className="text-gray-600">
            Monitor and analyze the health of your LLM response validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Validation Success Rate"
            value={`${(stats?.success_rate ?? 0).toFixed(1)}%`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Validation Failure Rate"
            value={`${(stats?.failure_rate ?? 0).toFixed(1)}%`}
            icon={XCircle}
            color="red"
          />
          <StatCard
            title="Auto-fix Success Rate"
            value={`${(stats?.autofix_success_rate ?? 0).toFixed(1)}%`}
            icon={Zap}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Issues Detected
            </h3>
            {issueBreakdown && Object.keys(issueBreakdown).length > 0 ? (
              <IssueChart data={issueBreakdown} />
            ) : (
              <p className="text-sm text-gray-500">
                No issues detected in the selected period.
              </p>
            )}
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Auto-fix Retry Statistics
            </h3>
            {autofixStats ? (
              <AutofixChart data={autofixStats} />
            ) : (
              <p className="text-sm text-gray-500">
                No auto-fix data available.
              </p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Validation Timeline
          </h3>
          <div className="flex space-x-4 mb-4">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "success" | "failure")
              }
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
              {issueBreakdown &&
                Object.keys(issueBreakdown).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
            </select>
          </div>
          <div className="h-96 overflow-y-auto border rounded-md">
            {timeline.length > 0 ? (
              timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                >
                  {event.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                  )}
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">
                      {event.request_summary}
                    </p>
                    {event.error_type && (
                      <p className="text-sm text-red-600">{event.error_type}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  No validation events for the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResponseValidatorPage;
