import { useNavigate } from "react-router-dom";
import { BookOpen, ExternalLink, Zap, Shield, DollarSign } from "lucide-react";
import Layout from "../components/Layout";

export default function DocsPage() {
  const navigate = useNavigate();

  return (
    <Layout title="API Documentation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              API Documentation
            </h2>
          </div>
          <p className="text-gray-600">
            Comprehensive documentation for the Cognitude API
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Autopilot Engine */}
            <div className="card-hover p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                Autopilot Engine
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Learn how to use smart routing to optimize costs.
              </p>
              <button
                onClick={() => navigate("/setup")}
                className="btn-ghost text-sm"
              >
                View Setup Guide →
              </button>
            </div>

            {/* Response Validator */}
            <div className="card-hover p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Response Validator
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Ensure you always get valid JSON responses.
              </p>
              <a
                href="https://api.cognitude.io/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm inline-flex items-center gap-1"
              >
                Open Swagger UI <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Budget Enforcement */}
            <div className="card-hover p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-600" />
                Budget Enforcement
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Prevent cost overruns with budget controls.
              </p>
              <button
                onClick={() => navigate("/rate-limits")}
                className="btn-ghost text-sm"
              >
                Configure Budgets →
              </button>
            </div>
          </div>
        </div>

        {/* Embedded ReDoc - Full Width */}
        <div className="flex-1">
          <div className="card">
            <iframe
              src="https://api.cognitude.io/redoc"
              className="w-full"
              title="Cognitude API Documentation"
              style={{ height: "800px" }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
