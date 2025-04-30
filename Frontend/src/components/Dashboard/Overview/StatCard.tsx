import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // State to track if the card has been viewed
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prevValue, setPrevValue] = useState('0');
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [isDecreasing, setIsDecreasing] = useState(false);

  // Extract numeric value for CountUp
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  const suffix = value.replace(/[0-9.-]+/g, '');

  // Track value changes for animation
  useEffect(() => {
    if (hasAnimated) {
      const prevNumericValue = parseFloat(prevValue.replace(/[^0-9.-]+/g, '')) || 0;

      if (numericValue > prevNumericValue) {
        setIsIncreasing(true);
        setTimeout(() => setIsIncreasing(false), 2000);
      } else if (numericValue < prevNumericValue) {
        setIsDecreasing(true);
        setTimeout(() => setIsDecreasing(false), 2000);
      }
    } else {
      setHasAnimated(true);
    }

    setPrevValue(value);
  }, [value]);

  // Create a light gradient based on the color
  const getGradient = (baseColor: string) => {
    // Extract the color code without opacity
    const colorCode = baseColor.startsWith('#') ? baseColor : '#10B981'; // Default to green if not hex

    // Create a very light gradient based on the color
    return `linear-gradient(135deg, ${colorCode}08, ${colorCode}15)`;
  };

  return (
    <motion.div
      className="rounded-xl p-5 shadow-sm border hover:shadow-md transition-all relative overflow-hidden"
      style={{
        background: getGradient(color),
        borderColor: `${color}25`,
      }}
      whileHover={{ y: -4, boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Value change indicator animation */}
      <AnimatePresence>
        {isIncreasing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 right-0 left-0 bottom-0 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <div className="absolute inset-0 bg-green-500 opacity-10 rounded-xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiArrowUp className="text-green-500 text-4xl animate-pulse" />
            </div>
          </motion.div>
        )}

        {isDecreasing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 right-0 left-0 bottom-0 pointer-events-none"
            style={{ zIndex: 5 }}
          >
            <div className="absolute inset-0 bg-red-500 opacity-10 rounded-xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiArrowDown className="text-red-500 text-4xl animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card content */}
      <div className="flex items-center justify-between">
        <motion.div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `${color}20`,
            boxShadow: `0 2px 10px ${color}15`
          }}
          whileHover={{ rotate: 5, scale: 1.1 }}
        >
          <span className="text-lg" style={{ color }}>{icon}</span>
        </motion.div>
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
        <motion.h2
          className="text-2xl font-bold"
          style={{ color: `${color}E0` }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CountUp
            end={numericValue}
            duration={2}
            separator=","
            decimals={value.includes('.') ? 1 : 0}
            suffix={suffix}
            useEasing={true}
          />
        </motion.h2>
      </div>

      {/* Decorative element */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-full opacity-10"
        style={{
          background: `linear-gradient(135deg, ${color}50, ${color})`,
          transform: 'translateX(30%) translateY(30%)'
        }}
      ></div>
    </motion.div>
  );
};

export default StatCard;
