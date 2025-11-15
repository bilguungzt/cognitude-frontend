import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [unavailable, setUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        } else if (mounted) {
          setLatest(null);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          if (mounted) {
            setUnavailable(true);
          }
        } else if (mounted) {
          setErrorMessage(api.handleError(err));
        }
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
            {unavailable ? (
              <p className="text-sm text-gray-600 mt-2">
                Detailed reconciliation reports are not available in this
                environment yet. Connect your billing exports to unlock this
                view.
              </p>
            ) : latest ? (
              <>
                <p className="text-lg font-semibold mt-1">
                  {latest.status === "DISCREPANCY_FOUND" ? (
                    <span className="text-red-600">Discrepancy</span>
                  ) : (
                    <span className="text-green-600">OK</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(latest.start_date).toLocaleDateString()} —{" "}
                  {new Date(latest.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Variance:{" "}
                  <strong>{formatCurrency(latest.variance_usd)}</strong> (
                  {latest.variance_percent?.toFixed(2)}%)
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                No reconciliation reports found
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-red-500 mt-3">{errorMessage}</p>
            )}
          </div>

          <div className="flex flex-col items-end">
            <button
              onClick={() => navigate("/cost")}
              className={`px-3 py-1 rounded text-sm ${
                latest && !unavailable
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!latest || unavailable}
            >
              {unavailable ? "Coming Soon" : "View Reports"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
