import React from 'react';
import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  rating: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  rating,
  size = 'medium',
  showLabel = true,
  label = 'Score',
  className = ''
}) => {
  // Get color based on rating
  const getScoreColor = (rating: string) => {
    const ratingLower = rating.toLowerCase();
    if (ratingLower.includes('excellent')) return { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' };
    if (ratingLower.includes('good')) return { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' };
    if (ratingLower.includes('fair')) return { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' };
    if (ratingLower.includes('poor')) return { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50' };
    if (ratingLower.includes('critical')) return { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-50' };
    return { bg: 'bg-slate-500', text: 'text-slate-500', light: 'bg-slate-50' };
  };

  const { bg, text, light } = getScoreColor(rating);

  // Size classes
  const sizeClasses = {
    small: {
      container: 'w-20 h-20',
      score: 'text-2xl',
      rating: 'text-xs px-2 py-0.5',
      label: 'text-xs'
    },
    medium: {
      container: 'w-32 h-32',
      score: 'text-4xl',
      rating: 'text-sm px-2.5 py-0.5',
      label: 'text-sm'
    },
    large: {
      container: 'w-40 h-40',
      score: 'text-6xl',
      rating: 'text-sm px-3 py-1',
      label: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div 
        className={`${classes.container} ${light} rounded-full flex flex-col items-center justify-center border-4 ${text} border-opacity-20`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.span 
          className={`${classes.score} font-bold ${text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {score}
        </motion.span>
        {showLabel && (
          <span className={`${classes.label} text-gray-500 mt-1`}>{label}</span>
        )}
      </motion.div>
      <motion.div 
        className={`${bg} ${classes.rating} rounded-full text-white font-medium mt-2`}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {rating}
      </motion.div>
    </div>
  );
};

export default ScoreDisplay;
