import React from 'react';
import { motion } from 'framer-motion';
import { colours } from '../../utils/colours';

interface ProfileCompletenessProps {
  profile: any;
  userType: 'startup' | 'investor' | null;
  socialLinks?: any[];
  teamMembers?: any[];
  investmentHistory?: any[];
}

const EnhancedProfileCompleteness: React.FC<ProfileCompletenessProps> = ({
  profile,
  userType,
  socialLinks = [],
  teamMembers = [],
  investmentHistory = []
}) => {
  const getCompletenessPercentage = () => {
    // Define required and optional fields
    let requiredFields: string[] = [];
    let optionalFields: string[] = [];
    let bonusFields: { name: string, items: any[] }[] = [];

    if (userType === 'startup') {
      requiredFields = ['companyName', 'industry', 'fundingStage'];
      optionalFields = ['employeeCount', 'location', 'pitch'];
      bonusFields = [
        { name: 'socialLinks', items: socialLinks },
        { name: 'teamMembers', items: teamMembers }
      ];
    } else if (userType === 'investor') {
      requiredFields = ['companyName', 'industriesOfInterest', 'preferredStages'];
      optionalFields = ['ticketSize', 'investmentCriteria', 'pastInvestments'];
      bonusFields = [
        { name: 'socialLinks', items: socialLinks },
        { name: 'investmentHistory', items: investmentHistory }
      ];
    }

    // Calculate completeness
    let requiredScore = 0;
    requiredFields.forEach(field => {
      if (Array.isArray(profile[field]) ? profile[field].length > 0 : profile[field]) {
        requiredScore++;
      }
    });

    let optionalScore = 0;
    optionalFields.forEach(field => {
      if (Array.isArray(profile[field]) ? profile[field].length > 0 : profile[field]) {
        optionalScore++;
      }
    });

    let bonusScore = 0;
    bonusFields.forEach(field => {
      if (field.items.length > 0) {
        bonusScore++;
      }
    });

    // Required fields are worth 50% of total score
    const requiredPercentage = requiredFields.length ? (requiredScore / requiredFields.length) * 50 : 0;

    // Optional fields make up 30% of total score
    const optionalPercentage = optionalFields.length ? (optionalScore / optionalFields.length) * 30 : 0;

    // Bonus fields make up 20% of total score
    const bonusPercentage = bonusFields.length ? (bonusScore / bonusFields.length) * 20 : 0;

    return Math.round(requiredPercentage + optionalPercentage + bonusPercentage);
  };

  const percentage = getCompletenessPercentage();

  // Get color based on completion percentage
  const getProgressColor = () => {
    if (percentage < 40) return colours.red500;
    if (percentage < 70) return colours.warningYellow;
    return colours.successGreen;
  };

  // Get message based on completion percentage
  const getMessage = () => {
    if (percentage < 40) return 'Your profile needs more information to attract matches';
    if (percentage < 70) return 'Your profile is getting there! Add more details to stand out';
    if (percentage < 90) return 'Your profile looks good! Just a few more details for perfection';
    return 'Your profile is excellent! You\'re all set to make great connections';
  };

  // Get emoji based on completion percentage
  const getEmoji = () => {
    if (percentage < 40) return { emoji: '😕', animation: { rotate: [0, -10, 0] } };
    if (percentage < 70) return { emoji: '🙂', animation: { rotate: [0, 10, 0] } };
    if (percentage < 90) return { emoji: '😃', animation: { rotate: [0, 10, 0, -10, 0] } };
    return { emoji: '🌟', animation: { scale: [1, 1.2, 1], rotate: [0, 5, 0, -5, 0] } };
  };

  // Get missing fields
  const getMissingFields = () => {
    const missingItems = [];

    if (userType === 'startup') {
      if (!profile.companyName) missingItems.push('Company Name');
      if (!profile.industry) missingItems.push('Industry');
      if (!profile.fundingStage) missingItems.push('Funding Stage');
      if (!profile.employeeCount) missingItems.push('Team Size');
      if (!profile.location) missingItems.push('Location');
      if (!profile.pitch) missingItems.push('Elevator Pitch');
      if (socialLinks.length === 0) missingItems.push('Social Media Links');
      if (teamMembers.length === 0) missingItems.push('Team Members');
    } else if (userType === 'investor') {
      if (!profile.companyName) missingItems.push('Firm Name');
      if (!profile.industriesOfInterest?.length) missingItems.push('Industries of Interest');
      if (!profile.preferredStages?.length) missingItems.push('Preferred Funding Stages');
      if (!profile.ticketSize) missingItems.push('Typical Ticket Size');
      if (!profile.investmentCriteria?.length) missingItems.push('Investment Criteria');
      if (!profile.pastInvestments) missingItems.push('Past Investments');
      if (socialLinks.length === 0) missingItems.push('Social Media Links');
      if (investmentHistory.length === 0) missingItems.push('Investment History');
    }

    return missingItems.slice(0, 3); // Return top 3 missing items
  };

  return (
    <div className="space-y-3 sm:space-y-4 bg-white rounded-xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center">
          <motion.div
            className="text-2xl sm:text-3xl mr-3 sm:mr-4 flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full shadow-lg border border-blue-100"
            animate={getEmoji().animation}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.1, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            {getEmoji().emoji}
          </motion.div>
          <div>
            <motion.span
              className="text-base sm:text-lg font-semibold text-gray-800 block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {percentage}% complete
            </motion.span>
            <motion.span
              className="text-xs text-gray-500 block mt-0.5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {userType === 'startup' ? 'Startup Profile' : 'Investor Profile'}
            </motion.span>
          </div>
        </div>
        <motion.div
          className="text-xs sm:text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 px-3 sm:px-5 py-2 sm:py-3 rounded-lg border border-blue-100 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        >
          {getMessage()}
        </motion.div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
        <motion.div
          className="h-3 sm:h-4 rounded-full relative"
          style={{ backgroundColor: getProgressColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)`,
              backgroundSize: '200% 100%'
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%']
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear'
            }}
          />

          {/* Animated dots */}
          {percentage > 30 && Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 transform -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white"
              style={{ left: `${10 + i * 15}%` }}
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </motion.div>
      </div>

      {percentage < 100 && (
        <motion.div
          className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start">
            <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mt-0.5 mx-auto sm:mx-0">
              <motion.div
                className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg"
                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                whileHover={{ scale: 1.15 }}
              >
                <svg className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </div>
            <div className="sm:ml-5">
              <motion.h4
                className="text-base sm:text-lg font-semibold text-blue-800 mb-2 sm:mb-3 text-center sm:text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              >
                Complete your profile
              </motion.h4>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-blue-50">
                <ul className="text-xs sm:text-sm text-blue-700 space-y-2 sm:space-y-3 mt-1">
                  {getMissingFields().map((field, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + (index * 0.1), duration: 0.3 }}
                      whileHover={{ x: 3 }}
                    >
                      <div className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-2 shadow-sm">
                        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium text-xs sm:text-sm">{field}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.div
                className="flex items-center mt-3 sm:mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.4 }}
                whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm text-blue-700 font-semibold">Adding these details will help you get better matches</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedProfileCompleteness;
