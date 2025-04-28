import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiMessageSquare, FiEye } from 'react-icons/fi';
import { colours } from '../../../utils/colours';

interface Match {
  id: string;
  name: string;
  description: string;
  compatibilityScore: number;
  location: string;
  industry: string;
  stage: string;
  logo: string;
  isNew: boolean;
}

interface MatchCardProps {
  match: Match;
  isBookmarked: boolean;
  toggleBookmark: (id: string) => void;
  isSelected: boolean;
  onClick: () => void;
  viewMode: 'grid' | 'list';
  role: string;
  index: number;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isBookmarked,
  toggleBookmark,
  isSelected,
  onClick,
  viewMode,
  role,
  index
}) => {
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';

  // Define gradient background based on role
  const cardGradient = role === 'startup'
    ? 'linear-gradient(135deg, rgba(239, 246, 255, 0.7), rgba(238, 242, 255, 0.7))'
    : 'linear-gradient(135deg, rgba(240, 253, 244, 0.7), rgba(236, 253, 245, 0.7))';

  const borderColor = role === 'startup' ? 'rgba(191, 219, 254, 0.5)' : 'rgba(167, 243, 208, 0.5)';
  const selectedBorderColor = role === 'startup' ? 'rgba(96, 165, 250, 0.7)' : 'rgba(16, 185, 129, 0.7)';

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    hover: {
      y: -4,
      boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2
      }
    }
  };

  // Handle bookmark click without triggering card click
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(match.id);
  };

  // Grid view card
  if (viewMode === 'grid') {
    return (
      <motion.div
        className="rounded-xl overflow-hidden cursor-pointer transition-all"
        style={{
          background: cardGradient,
          border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
          boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.03)'
        }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        custom={index}
        onClick={onClick}
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <img src={match.logo} alt={match.name} className="w-full h-full object-cover" />
              </div>

              <div className="ml-3">
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-800">{match.name}</h3>
                  {match.isNew && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">New</span>
                  )}
                </div>

                <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                  <span>{match.location}</span>
                  <span>•</span>
                  <span>{match.industry}</span>
                </div>
              </div>
            </div>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: `conic-gradient(${primaryColor} ${match.compatibilityScore}%, #e5e7eb ${match.compatibilityScore}% 100%)`
              }}
            >
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <span style={{ color: primaryColor }}>{match.compatibilityScore}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{match.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {match.stage}
            </span>

            <div className="flex space-x-1">
              <motion.button
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmarkClick}
              >
                <FiStar
                  size={16}
                  className={isBookmarked ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                />
              </motion.button>
              <motion.button
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
                style={{ color: primaryColor }}
              >
                <FiMessageSquare size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // List view card
  return (
    <motion.div
      className="rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: cardGradient,
        border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
        boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.03)'
      }}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start">
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
            <img src={match.logo} alt={match.name} className="w-full h-full object-cover" />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-800">{match.name}</h3>
                  {match.isNew && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">New</span>
                  )}
                </div>

                <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                  <span>{match.location}</span>
                  <span>•</span>
                  <span>{match.industry}</span>
                  <span>•</span>
                  <span>{match.stage}</span>
                </div>
              </div>

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: `conic-gradient(${primaryColor} ${match.compatibilityScore}%, #e5e7eb ${match.compatibilityScore}% 100%)`
                }}
              >
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <span style={{ color: primaryColor }}>{match.compatibilityScore}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{match.description}</p>

            <div className="mt-3 flex items-center justify-end space-x-2">
              <motion.button
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmarkClick}
              >
                <FiStar
                  size={16}
                  className={isBookmarked ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}
                />
              </motion.button>
              <motion.button
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <FiEye size={16} className="text-gray-500" />
              </motion.button>
              <motion.button
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.9 }}
                style={{ color: primaryColor }}
              >
                <FiMessageSquare size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
