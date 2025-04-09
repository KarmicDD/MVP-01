import React from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle } from 'react-icons/fi';

interface TutorialButtonProps {
  onClick: () => void;
  className?: string;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({ onClick, className = '' }) => {
  return (
    <motion.button
      className={`bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label="Open Tutorial"
      title="Open Tutorial"
    >
      <FiHelpCircle size={24} />
    </motion.button>
  );
};

export default TutorialButton;
