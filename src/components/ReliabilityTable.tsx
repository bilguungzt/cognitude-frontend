import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ValidationLog } from '../types/api';
import StatusBadge from './StatusBadge';
import Skeleton from './Skeleton';

const ReliabilityTable: React.FC = () => {
  const [logs, setLogs] = useState<ValidationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await api.getValidationLogs();
        setLogs(data);
      } catch (err) {
        setError(api.handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Timestamp</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Error Details</th>
            <th className="px-4 py-2 text-left">Request ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="px-4 py-2">
                <StatusBadge status={log.status} />
              </td>
              <td className="px-4 py-2">{log.error_details || 'N/A'}</td>
              <td className="px-4 py-2">{log.request_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReliabilityTable;