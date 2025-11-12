import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  comparisonText?: string;
  color?: 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  comparisonText, 
  color = 'blue' 
}) => {
  // Define color classes for different color options
  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      comparison: 'text-green-600'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      comparison: 'text-red-600'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      comparison: 'text-blue-600'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      comparison: 'text-purple-600'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      comparison: 'text-yellow-600'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      comparison: 'text-indigo-600'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`card p-5 ${currentColor.bg} border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {comparisonText && (
            <p className={`text-xs mt-2 ${currentColor.comparison} flex items-center`}>
              {comparisonText}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${currentColor.iconBg}`}>
          <Icon className={`w-5 h-5 ${currentColor.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;