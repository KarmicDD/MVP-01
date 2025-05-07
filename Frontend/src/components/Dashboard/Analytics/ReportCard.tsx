import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ReportCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
  delay?: number;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  icon,
  children,
  className = '',
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  delay = 0
}) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center mb-4">
        <div className={`${iconBgColor} p-2 rounded-lg mr-3 flex items-center justify-center`}>
          <div className={`${iconColor} text-xl`}>{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
};

export default ReportCard;
