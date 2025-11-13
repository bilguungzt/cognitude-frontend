import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services";

type ReconciliationReport = {
  id: number;
  start_date: string;
  end_date: string;
  internal_cost_usd: number;
  external_cost_usd: number;
  variance_usd: number;
  variance_percent: number;
  status: string;
  created_at?: string;
};

export default function ReconciliationCard() {
  const [latest, setLatest] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // the API client exposes getReconciliationReports
  const data = await api.getReconciliationReports();
        // Expecting an array or { reports: [] }
        let list: ReconciliationReport[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data.reports)) list = data.reports;

        if (mounted && list.length > 0) {
          setLatest(list[0]);
        }
      } catch {
        // silence - keep card lightweight
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(v || 0);

  if (loading) {
    return (
      <div className="card hover:shadow-md transition-shadow">
        <div className="p-4">
          <p className="text-sm text-gray-500">Loading reconciliation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">Reconciliation</p>
            {latest ? (
              <>
                <p className="text-lg font-semibold mt-1">
                  {latest.status === "DISCREPANCY_FOUND" ? (
                    <span className="text-red-600">Discrepancy</span>
                  ) : (
                    <span className="text-green-600">OK</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(latest.start_date).toLocaleDateString()} — {new Date(latest.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Variance: <strong>{formatCurrency(latest.variance_usd)}</strong> ({latest.variance_percent?.toFixed(2)}%)
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 mt-1">No reconciliation reports found</p>
            )}
          </div>

          <div className="flex flex-col items-end">
            <button
              onClick={() => navigate("/reconciliation")}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
