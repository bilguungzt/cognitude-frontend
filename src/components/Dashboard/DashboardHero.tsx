import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';

interface DashboardHeroProps {
  couldHaveSpent: number;
  actuallySpent: number;
  totalSavings: number;
  projectedMonthlySavings: number;
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(latest);
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const DashboardHero = ({
  couldHaveSpent,
  actuallySpent,
  totalSavings,
  projectedMonthlySavings,
}: DashboardHeroProps) => {
  const costEfficiency = couldHaveSpent > 0 ? (actuallySpent / couldHaveSpent) * 100 : 0;
  const efficiencyPercentage = 100 - costEfficiency;

  return (
    <div className="relative p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 shadow-2xl border border-white/10">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xl"></div>
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* Left Side: Comparison */}
        <div className="flex flex-col justify-center text-white space-y-4">
          <div className="flex items-center space-x-3">
            <FiArrowUp className="text-red-400 text-3xl" />
            <div>
              <p className="text-lg text-gray-300">Could Have Spent</p>
              <p className="text-2xl md:text-3xl font-bold">${couldHaveSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FiArrowDown className="text-green-400 text-3xl" />
            <div>
              <p className="text-lg text-gray-300">Actually Spent</p>
              <p className="text-2xl md:text-3xl font-bold">${actuallySpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Center: Total Savings */}
        <div className="text-center text-white">
          <h2 className="text-2xl font-medium text-gray-300 mb-2">Total Savings</h2>
          <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400">
            <AnimatedCounter value={totalSavings} />
          </div>
        </div>

        {/* Right Side: Efficiency & Projections */}
        <div className="flex flex-col justify-center text-white space-y-6">
          <div>
            <h3 className="text-lg text-gray-300 mb-2">Cost Efficiency</h3>
            <div className="w-full bg-gray-700/50 rounded-full h-4 border border-white/10">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-cyan-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${efficiencyPercentage}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
            <p className="text-right mt-1 text-lg font-bold">{efficiencyPercentage.toFixed(1)}%</p>
          </div>
          <div>
            <h3 className="text-lg text-gray-300">Projected Monthly Savings</h3>
            <p className="text-2xl md:text-3xl font-bold">${projectedMonthlySavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;