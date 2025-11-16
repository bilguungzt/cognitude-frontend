import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader,
  Upload,
} from "lucide-react";
import api from "../../services";
import { CountUp } from "./EnhancedStatCard";
import type { ReconciliationReport } from "../../types/api";
import axios from "axios";

const statusConfig = {
  OK: {
    Icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "OK",
  },
  DISCREPANCY_FOUND: {
    Icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Discrepancy",
  },
  ERROR: {
    Icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Error",
  },
  PENDING: {
    Icon: Loader,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "Pending",
  },
};

const SkeletonLoader = () => (
  <div className="relative p-6 rounded-lg shadow-sm bg-gray-500/10 animate-pulse">
    <div className="flex items-start justify-between">
      <div>
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-400 rounded w-32 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-40 mb-4"></div>
        <div className="h-5 bg-gray-400 rounded w-48"></div>
      </div>
      <div className="h-8 bg-gray-400 rounded w-28"></div>
    </div>
  </div>
);

export default function CostReconciliationCard() {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await api.getReconciliationReports();
        const list = response.reports || [];
        if (list.length > 0) {
          setReport(list[0]);
        } else {
          setReport(null);
        }
      } catch (error) {
        console.error("Failed to fetch reconciliation reports:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setUnavailable(true);
        } else {
          setReport({
            id: 0,
            start_date: "",
            end_date: "",
            variance_usd: 0,
            variance_percent: 0,
            status: "ERROR",
            internal_cost_usd: 0,
            external_cost_usd: 0,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const currentStatus = report ? report.status : "PENDING";
  const config = statusConfig[currentStatus] || statusConfig.PENDING;

  if (loading) {
    return <SkeletonLoader />;
  }

  if (unavailable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative p-6 rounded-lg shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">Cost Reconciliation</p>
            <div className="flex items-center mt-2 mb-3">
              <Upload className="mr-2 h-5 w-5 text-purple-600" />
              <p className="text-lg font-semibold text-gray-900">Coming Soon</p>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Reconcile your LLM costs with cloud provider bills. Connect your
              billing exports to automatically track variances and ensure
              accurate cost reporting.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-semibold cursor-not-allowed"
          >
            Coming Soon
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative p-6 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${config.bgColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Cost Reconciliation</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStatus}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center mt-1"
            >
              <config.Icon className={`mr-2 h-6 w-6 ${config.color}`} />
              <p className={`text-xl font-semibold ${config.color}`}>
                {config.label}
              </p>
            </motion.div>
          </AnimatePresence>
          {report &&
            report.status !== "PENDING" &&
            report.start_date &&
            report.end_date && (
              <>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(report.start_date).toLocaleDateString()} —{" "}
                  {new Date(report.end_date).toLocaleDateString()}
                </p>
                <div className="text-lg text-gray-800 mt-2 font-medium">
                  <CountUp value={report.variance_usd} prefix="$" />
                  <span className="text-sm ml-2 text-gray-600">
                    (<CountUp value={report.variance_percent} suffix="%" />)
                  </span>
                </div>
              </>
            )}
        </div>
        <motion.button
          onClick={() => navigate("/reconciliation")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          View Reports
        </motion.button>
      </div>
    </motion.div>
  );
}
