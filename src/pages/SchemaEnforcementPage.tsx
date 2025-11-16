import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Button } from "../components/Button";
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileJson,
  BookOpen,
  Sparkles,
  BarChart3,
  TrendingDown,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import type { SchemaStat, ValidationLog } from "../types/api";
import { UploadSchemaModal } from "../components/UploadSchemaModal";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";

type StatColor = "purple" | "green" | "red";

const statColorClasses: Record<StatColor, { bg: string; text: string }> = {
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

interface StatCardProps {
  title: string;
  value: string | number;
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
      <div className={`p-3 rounded-full ${statColorClasses[color].bg}`}>
        <Icon className={`w-6 h-6 ${statColorClasses[color].text}`} />
      </div>
    </div>
  </div>
);

const QUICK_START_TEMPLATES = [
  {
    name: "Contact Extraction",
    description: "Extract names, emails, phones from text",
    icon: Sparkles,
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
      },
      required: ["name", "email"],
    },
  },
  {
    name: "Sentiment Analysis",
    description: "Classify text sentiment with confidence",
    icon: BarChart3,
    schema: {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "negative", "neutral"],
        },
        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["sentiment", "confidence"],
    },
  },
  {
    name: "Data Classification",
    description: "Categorize items with confidence scores",
    icon: TrendingDown,
    schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        subcategory: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["category"],
    },
  },
];

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
      if (
        err instanceof AxiosError &&
        err.response &&
        err.response.status === 404
      ) {
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
      ? ((totalAttempts - totalFailures) / totalAttempts) * 100
      : 100;
  const roundedFailures = Math.round(totalFailures);

  const hasNoData =
    activeSchemas.length === 0 && topSchemas.length === 0 && logs.length === 0;

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
              label: "Retry",
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Schema Enforcement
            </h2>
            <p className="text-gray-600">
              Ensure your LLM responses adhere to predefined JSON schemas.
            </p>
          </div>
          {!hasNoData && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Schema
            </Button>
          )}
        </div>

        {/* Educational Empty State */}
        {hasNoData && (
          <>
            <div className="card p-8 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileJson className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    📋 What are Schemas?
                  </h3>
                  <p className="text-gray-700 mb-4 text-lg">
                    Ensure LLM responses match your exact format requirements.
                    Perfect for:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>API responses</strong> that feed other systems
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Data extraction</strong> that must be parseable
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Preventing hallucinated structure</strong> in
                        responses
                      </span>
                    </li>
                  </ul>
                  <div className="flex gap-3">
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" /> Create Your First
                      Schema
                    </Button>
                    <button
                      className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded flex items-center border border-gray-300"
                      onClick={() =>
                        window.open(
                          "https://json-schema.org/learn/getting-started-step-by-step",
                          "_blank"
                        )
                      }
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Start Templates */}
            <div className="card p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                🎯 Quick Start Templates
              </h3>
              <p className="text-gray-600 mb-6">
                Start with a pre-built schema template or create your own
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {QUICK_START_TEMPLATES.map((template) => (
                  <div
                    key={template.name}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {}}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <template.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>
                    <div className="bg-gray-50 rounded p-3 font-mono text-xs text-gray-700 overflow-x-auto">
                      <pre>
                        {JSON.stringify(template.schema, null, 2).substring(
                          0,
                          100
                        )}
                        ...
                      </pre>
                    </div>
                    <button
                      className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded flex items-center justify-center text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpen(true);
                      }}
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded flex items-center justify-center border border-gray-300"
                onClick={() => setIsModalOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" /> Create Custom Schema
              </button>
            </div>
          </>
        )}

        {/* Stats Cards - Only show if we have data */}
        {!hasNoData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Active Schemas"
                value={activeSchemas.length}
                icon={FileJson}
                color="purple"
              />
              <StatCard
                title="Overall Success Rate"
                value={`${overallSuccessRate.toFixed(1)}%`}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Total Failures (24h)"
                value={roundedFailures}
                icon={XCircle}
                color="red"
              />
            </div>

            {/* Performance Insights */}
            {activeSchemas.length > 0 && (
              <div className="card p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Performance Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Most Failing Schema
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {activeSchemas.sort(
                        (a, b) => b.failure_rate - a.failure_rate
                      )[0]?.schema_name || "N/A"}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {(
                        (activeSchemas.sort(
                          (a, b) => b.failure_rate - a.failure_rate
                        )[0]?.failure_rate || 0) * 100
                      ).toFixed(1)}
                      % failure rate
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Avg Retries Before Success
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {(
                        activeSchemas.reduce(
                          (acc, s) => acc + s.avg_retries,
                          0
                        ) / activeSchemas.length
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Across all schemas
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Most Used Schema
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {activeSchemas.sort(
                        (a, b) => b.total_attempts - a.total_attempts
                      )[0]?.schema_name || "N/A"}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      {activeSchemas.sort(
                        (a, b) => b.total_attempts - a.total_attempts
                      )[0]?.total_attempts || 0}{" "}
                      attempts
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!hasNoData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Active Schemas
              </h3>
              {activeSchemas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Schema Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Attempts
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Failure Rate
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Avg. Retries
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeSchemas.map((schema) => (
                        <tr
                          key={schema.schema_name}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {schema.schema_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schema.total_attempts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                schema.failure_rate > 0.5
                                  ? "bg-red-100 text-red-800"
                                  : schema.failure_rate > 0.2
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {(schema.failure_rate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schema.avg_retries.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No active schemas found.
                </p>
              )}
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top 5 Most Used Schemas
              </h3>
              {topSchemas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Schema Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total Attempts
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Failure Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topSchemas.map((schema) => (
                        <tr
                          key={schema.schema_name}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {schema.schema_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {schema.total_attempts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                schema.failure_rate > 0.5
                                  ? "bg-red-100 text-red-800"
                                  : schema.failure_rate > 0.2
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {(schema.failure_rate * 100).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No schema statistics available.
                </p>
              )}
            </div>
          </div>
        )}

        {!hasNoData && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Failed Validation Logs (Last 24h)
            </h3>
            {logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-red-100 rounded-lg p-4 bg-red-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-mono text-xs text-gray-600">
                          Request ID: {log.request_id}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white rounded p-3 border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        Error:
                      </p>
                      <p className="text-sm text-red-600 font-mono">
                        {log.error_details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No failed validation logs in the last 24 hours.
              </p>
            )}
          </div>
        )}
      </div>
      <UploadSchemaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSchemaUploaded={() => fetchData()}
      />
    </Layout>
  );
};

export default SchemaEnforcementPage;
