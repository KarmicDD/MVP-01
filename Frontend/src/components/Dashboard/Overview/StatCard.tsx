import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import CountUp from 'react-countup';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  // Extract numeric value for CountUp
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
  const suffix = value.replace(/[0-9.-]+/g, '');

  // Create a light gradient based on the color
  const getGradient = (baseColor: string) => {
    // Extract the color code without opacity
    const colorCode = baseColor.startsWith('#') ? baseColor : '#10B981'; // Default to green if not hex

    // Create a very light gradient based on the color
    return `linear-gradient(135deg, ${colorCode}08, ${colorCode}12)`;
  };

  return (
    <motion.div
      className="rounded-xl p-5 shadow-sm border hover:shadow-md transition-all"
      style={{
        background: getGradient(color),
        borderColor: `${color}25`,
      }}
      whileHover={{ y: -4, boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${color}20`,
            boxShadow: `0 2px 10px ${color}15`
          }}
        >
          <span className="text-lg" style={{ color }}>{icon}</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${change >= 0
            ? 'bg-green-50 text-green-600 border border-green-100'
            : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
          {change >= 0 ? <FiArrowUp size={12} className="mr-1" /> : <FiArrowDown size={12} className="mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>

      <h3 className="mt-4 text-sm font-medium text-gray-600">{title}</h3>
      <div className="mt-1 flex items-baseline">
        <h2 className="text-2xl font-bold" style={{ color: `${color}E0` }}>
          <CountUp
            end={numericValue}
            duration={2}
            separator=","
            decimals={value.includes('.') ? 1 : 0}
            suffix={suffix}
          />
        </h2>
      </div>
    </motion.div>
  );
};

export default StatCard;
