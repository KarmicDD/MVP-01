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
    if (percentage < 40) return '😕';
    if (percentage < 70) return '🙂';
    if (percentage < 90) return '😃';
    return '🌟';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getEmoji()}</span>
          <span className="text-sm font-medium text-gray-700">{percentage}% complete</span>
        </div>
        <span className="text-sm text-gray-500">
          {getMessage()}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="h-2.5 rounded-full"
          style={{ backgroundColor: getProgressColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      {percentage < 100 && (
        <div className="mt-3 bg-blue-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Suggested improvements:</h4>
          <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
            {getMissingFields().map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedProfileCompleteness;
