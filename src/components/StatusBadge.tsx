import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'failure';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeColor = status === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <span className={`px-2 py-1 text-white rounded ${badgeColor}`}>
      {status}
    </span>
  );
};

export default StatusBadge;