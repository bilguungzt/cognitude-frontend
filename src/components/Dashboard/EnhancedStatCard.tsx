import React from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import type { LucideProps } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

interface EnhancedStatCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  value: number;
  trend: string;
  sparklineData: { name: string; value: number }[];
  color: 'green' | 'blue' | 'purple' | 'orange';
  tooltipText: string;
  prefix?: string;
  suffix?: string;
}

const colorVariants = {
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    sparkline: '#10B981',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    sparkline: '#3B82F6',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    sparkline: '#8B5CF6',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    sparkline: '#F97316',
  },
};

export const CountUp = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const display = useTransform(rounded, (latest) => `${prefix}${latest.toLocaleString()}${suffix}`);


  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
};


export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  icon: Icon,
  title,
  value,
  trend,
  sparklineData,
  color,
  tooltipText,
  prefix,
  suffix,
}) => {
  const selectedColor = colorVariants[color];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative p-6 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg ${selectedColor.bg}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center text-sm font-medium text-gray-400">
                  <Icon className={`mr-2 h-5 w-5 ${selectedColor.text}`} />
                  {title}
                </div>
                <motion.div
                  className="mt-2 text-2xl font-bold text-gray-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CountUp value={value} prefix={prefix} suffix={suffix} />
                </motion.div>
                <div className="mt-2 text-xs text-gray-400">{trend}</div>
              </div>
              <div className="absolute bottom-4 right-4 h-16 w-32">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={sparklineData}>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#9ca3af' }}
                      itemStyle={{ color: selectedColor.sparkline }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={selectedColor.sparkline}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};