import React from 'react';
import ReliabilityTable from '../components/ReliabilityTable';
const ReliabilityPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reliability</h1>
      
      <div className="flex space-x-4 mb-4">
        {/* Status Filter */}
        <select className="border rounded p-2">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>

        {/* Date Range Filter */}
        <select className="border rounded p-2">
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <ReliabilityTable />
    </div>
  );
};

export default ReliabilityPage;